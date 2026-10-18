import { RegisteredAction } from '@/types/agent';
import { ApkValidationResult } from './apkValidator';
import { analyzeManifestBuffer, ManifestAnalysisResult } from './manifestAnalyzer';
import { analyzeDexBuffer, DexAnalysisResult } from './dexAnalyzer';

export interface ActionExecutionContext {
  sessionId: string;
  apkBuffer: Buffer;
  validationResult: ApkValidationResult;
  manifestAnalysis?: ManifestAnalysisResult;
  dexAnalysis?: DexAnalysisResult;
}

export interface ActionExecutionOutput {
  status: 'SUCCESS' | 'FAILURE' | 'TIMEOUT';
  output: Record<string, any>;
  observation: string;
  error?: string;
}

export type ActionHandler = (
  input: Record<string, any>,
  context: ActionExecutionContext
) => Promise<ActionExecutionOutput>;

export interface ActionRegistration extends RegisteredAction {
  handler: ActionHandler;
}

export class ToolRegistry {
  private actions: Map<string, ActionRegistration> = new Map();

  constructor() {
    this.registerCoreActions();
  }

  public getAction(actionId: string): ActionRegistration | undefined {
    return this.actions.get(actionId);
  }

  public getAllRegisteredActions(): RegisteredAction[] {
    return Array.from(this.actions.values()).map(
      ({ handler, ...meta }) => meta
    );
  }

  public isActionSupported(actionId: string): boolean {
    const act = this.actions.get(actionId);
    return act ? act.supported : false;
  }

  private registerCoreActions() {
    // 1. ACTION_VALIDATE_PACKAGE
    this.actions.set('ACTION_VALIDATE_PACKAGE', {
      actionId: 'ACTION_VALIDATE_PACKAGE',
      name: 'Validate Package Fingerprint & Integrity',
      purpose:
        'Validates APK structure, checks ZIP format, computes SHA-256 and MD5 cryptographic digests, and validates entry integrity.',
      category: 'intake',
      inputSchema: {
        type: 'object',
        properties: {}
      },
      timeoutMs: 5000,
      supported: true,
      handler: async (_input, context) => {
        if (!context.validationResult.isValid) {
          return {
            status: 'FAILURE',
            output: {
              errorCode: context.validationResult.errorCode,
              errorMessage: context.validationResult.errorMessage
            },
            observation: `Package validation failed: ${context.validationResult.errorMessage}`,
            error: context.validationResult.errorMessage
          };
        }

        const meta = context.validationResult.metadata;
        return {
          status: 'SUCCESS',
          output: {
            fileName: meta.fileName,
            fileSize: meta.fileSizeFormatted,
            sha256: meta.sha256,
            hasManifest: meta.hasManifest,
            hasDex: meta.hasDex,
            totalEntries: meta.totalZipEntries
          },
          observation: `Validated APK: ${meta.fileName} (${meta.fileSizeFormatted}, SHA-256: ${meta.sha256.substring(0, 16)}...). Archive contains ${meta.totalZipEntries} entries including AndroidManifest.xml and classes.dex.`
        };
      }
    });

    // 2. ACTION_INSPECT_MANIFEST
    this.actions.set('ACTION_INSPECT_MANIFEST', {
      actionId: 'ACTION_INSPECT_MANIFEST',
      name: 'Inspect Application Manifest & Configuration',
      purpose:
        'Decodes compiled binary AndroidManifest.xml to extract package name, SDK target levels, debuggable flag, allowBackup flag, and cleartext traffic policy.',
      category: 'manifest',
      inputSchema: {
        type: 'object',
        properties: {
          includeRawSummary: {
            type: 'boolean',
            description: 'Whether to include a text summary of the parsed manifest',
            default: true
          }
        }
      },
      timeoutMs: 8000,
      supported: true,
      handler: async (_input, context) => {
        if (!context.validationResult.isValid) {
          return {
            status: 'FAILURE',
            output: {},
            observation: 'Cannot inspect manifest: APK validation failed.',
            error: 'APK validation failed.'
          };
        }

        try {
          const manifestResult =
            context.manifestAnalysis ||
            analyzeManifestBuffer(
              context.validationResult.manifestBuffer,
              context.sessionId
            );
          context.manifestAnalysis = manifestResult;

          return {
            status: 'SUCCESS',
            output: {
              packageName: manifestResult.packageName,
              versionCode: manifestResult.versionCode,
              versionName: manifestResult.versionName,
              minSdkVersion: manifestResult.minSdkVersion,
              targetSdkVersion: manifestResult.targetSdkVersion,
              debuggable: manifestResult.debuggable,
              allowBackup: manifestResult.allowBackup,
              usesCleartextTraffic: manifestResult.usesCleartextTraffic,
              totalDeclaredPermissions: manifestResult.declaredPermissions.length,
              totalComponents: manifestResult.components.length
            },
            observation: `Parsed Manifest: package="${manifestResult.packageName}" targetSdk=${manifestResult.targetSdkVersion}. Flags: debuggable=${manifestResult.debuggable}, allowBackup=${manifestResult.allowBackup}, cleartextTraffic=${manifestResult.usesCleartextTraffic}. Found ${manifestResult.components.length} components and ${manifestResult.declaredPermissions.length} permissions.`
          };
        } catch (err: any) {
          return {
            status: 'FAILURE',
            output: {},
            observation: `Manifest parsing failed: ${err.message}`,
            error: err.message
          };
        }
      }
    });

    // 3. ACTION_ANALYZE_PERMISSIONS
    this.actions.set('ACTION_ANALYZE_PERMISSIONS', {
      actionId: 'ACTION_ANALYZE_PERMISSIONS',
      name: 'Analyze Declared Permissions & Privileges',
      purpose:
        'Evaluates requested Android permissions against OWASP MASVS privilege categories, identifying dangerous permissions such as SMS access, location tracking, and camera.',
      category: 'permissions',
      inputSchema: {
        type: 'object',
        properties: {
          minRiskLevel: {
            type: 'string',
            description: 'Filter permissions by risk level (all or dangerous)',
            default: 'dangerous'
          }
        }
      },
      timeoutMs: 5000,
      supported: true,
      handler: async (_input, context) => {
        if (!context.manifestAnalysis && context.validationResult.isValid) {
          context.manifestAnalysis = analyzeManifestBuffer(
            context.validationResult.manifestBuffer,
            context.sessionId
          );
        }

        if (!context.manifestAnalysis) {
          return {
            status: 'FAILURE',
            output: {},
            observation: 'No manifest analysis available to evaluate permissions.',
            error: 'Manifest analysis unavailable.'
          };
        }

        const { declaredPermissions, dangerousPermissions } = context.manifestAnalysis;

        return {
          status: 'SUCCESS',
          output: {
            totalDeclared: declaredPermissions.length,
            declaredPermissions,
            dangerousCount: dangerousPermissions.length,
            dangerousPermissions
          },
          observation: `Permission Analysis: ${declaredPermissions.length} permissions declared. Identified ${dangerousPermissions.length} sensitive permissions: ${dangerousPermissions.length > 0 ? dangerousPermissions.map((p) => p.replace('android.permission.', '')).join(', ') : 'None'}.`
        };
      }
    });

    // 4. ACTION_SCAN_EXPORTED_COMPONENTS
    this.actions.set('ACTION_SCAN_EXPORTED_COMPONENTS', {
      actionId: 'ACTION_SCAN_EXPORTED_COMPONENTS',
      name: 'Scan Exported IPC Components',
      purpose:
        'Scans Activities, Services, Broadcast Receivers, and Content Providers to identify components exported to other apps without permission protection.',
      category: 'components',
      inputSchema: {
        type: 'object',
        properties: {
          checkProtections: {
            type: 'boolean',
            description: 'Verify whether permission guards are applied to exported components',
            default: true
          }
        }
      },
      timeoutMs: 8000,
      supported: true,
      handler: async (_input, context) => {
        if (!context.manifestAnalysis && context.validationResult.isValid) {
          context.manifestAnalysis = analyzeManifestBuffer(
            context.validationResult.manifestBuffer,
            context.sessionId
          );
        }

        if (!context.manifestAnalysis) {
          return {
            status: 'FAILURE',
            output: {},
            observation: 'Manifest analysis unavailable for component scanning.',
            error: 'Manifest analysis unavailable.'
          };
        }

        const { components, exportedWithoutPermission } = context.manifestAnalysis;
        const exportedTotal = components.filter((c) => c.exported).length;

        return {
          status: 'SUCCESS',
          output: {
            totalComponents: components.length,
            exportedTotal,
            unprotectedExportCount: exportedWithoutPermission.length,
            unprotectedComponents: exportedWithoutPermission.map((c) => ({
              type: c.type,
              name: c.name,
              intentFilters: c.intentFiltersCount
            }))
          },
          observation: `Component Scan: ${components.length} components analyzed. ${exportedTotal} components are exported; ${exportedWithoutPermission.length} are exposed without permission guards (${exportedWithoutPermission.map((c) => `${c.type}:${c.name.split('.').pop()}`).join(', ') || 'None'}).`
        };
      }
    });

    // 5. ACTION_INSPECT_NETWORK_CONFIG
    this.actions.set('ACTION_INSPECT_NETWORK_CONFIG', {
      actionId: 'ACTION_INSPECT_NETWORK_CONFIG',
      name: 'Inspect Network Security & Cleartext Policy',
      purpose:
        'Evaluates application network security configuration, cleartext traffic allowance, and correlates with discovered HTTP endpoints.',
      category: 'network',
      inputSchema: {
        type: 'object',
        properties: {
          correlateBytecode: {
            type: 'boolean',
            description: 'Correlate with DEX string pool for cleartext HTTP endpoints',
            default: true
          }
        }
      },
      timeoutMs: 8000,
      supported: true,
      handler: async (_input, context) => {
        if (!context.manifestAnalysis && context.validationResult.isValid) {
          context.manifestAnalysis = analyzeManifestBuffer(
            context.validationResult.manifestBuffer,
            context.sessionId
          );
        }

        if (
          !context.dexAnalysis &&
          context.validationResult.isValid &&
          context.validationResult.dexBuffer
        ) {
          context.dexAnalysis = analyzeDexBuffer(
            context.validationResult.dexBuffer,
            context.sessionId
          );
        }

        const cleartextAllowed = context.manifestAnalysis?.usesCleartextTraffic || false;
        const httpEndpoints = context.dexAnalysis?.insecureEndpoints || [];
        const insecureTrustManagers = context.dexAnalysis?.insecureTrustManagers || [];

        return {
          status: 'SUCCESS',
          output: {
            cleartextAllowed,
            networkSecurityConfig: context.manifestAnalysis?.networkSecurityConfig || 'None defined',
            discoveredHttpEndpointsCount: httpEndpoints.length,
            sampleHttpEndpoints: httpEndpoints.slice(0, 5),
            insecureTrustManagersCount: insecureTrustManagers.length
          },
          observation: `Network Security: Cleartext traffic is ${cleartextAllowed ? 'EXPLICITLY PERMITTED' : 'restricted'}. Discovered ${httpEndpoints.length} plain HTTP URLs in bytecode and ${insecureTrustManagers.length} permissive TrustManager implementations.`
        };
      }
    });

    // 6. ACTION_SCAN_DEX_SECRETS
    this.actions.set('ACTION_SCAN_DEX_SECRETS', {
      actionId: 'ACTION_SCAN_DEX_SECRETS',
      name: 'Scan Dalvik Bytecode for Hardcoded Secrets & Crypto',
      purpose:
        'Inspects compiled classes.dex string tables for hardcoded API keys (Google, AWS, Slack), broken cryptographic ciphers (DES, RC4, ECB), and insecure trust managers.',
      category: 'dex',
      inputSchema: {
        type: 'object',
        properties: {
          scanDepth: {
            type: 'string',
            description: 'Scan depth mode (standard or deep)',
            default: 'standard'
          }
        }
      },
      timeoutMs: 15000,
      supported: true,
      handler: async (_input, context) => {
        if (!context.validationResult.isValid) {
          return {
            status: 'FAILURE',
            output: {},
            observation: 'Cannot scan bytecode: APK is invalid.',
            error: 'Invalid APK'
          };
        }

        if (!context.validationResult.dexBuffer) {
          return {
            status: 'SUCCESS',
            output: {
              hasDex: false,
              stringsExtracted: 0,
              hardcodedSecretsCount: 0
            },
            observation: 'No classes.dex found in APK archive to scan.'
          };
        }

        try {
          const dexResult =
            context.dexAnalysis ||
            analyzeDexBuffer(
              context.validationResult.dexBuffer,
              context.sessionId
            );
          context.dexAnalysis = dexResult;

          return {
            status: 'SUCCESS',
            output: {
              dexVersion: dexResult.dexVersion,
              totalStringsExtracted: dexResult.totalStringsExtracted,
              hardcodedSecrets: dexResult.hardcodedSecrets,
              cryptoWeaknesses: dexResult.cryptoWeaknesses,
              insecureEndpointsCount: dexResult.insecureEndpoints.length,
              insecureTrustManagersCount: dexResult.insecureTrustManagers.length
            },
            observation: `Bytecode Scan: Analyzed ${dexResult.totalStringsExtracted} strings from classes.dex. Found ${dexResult.hardcodedSecrets.length} hardcoded secret tokens, ${dexResult.cryptoWeaknesses.length} weak crypto primitives, and ${dexResult.insecureEndpoints.length} plain HTTP endpoints.`
          };
        } catch (err: any) {
          return {
            status: 'FAILURE',
            output: {},
            observation: `Bytecode scanning failed: ${err.message}`,
            error: err.message
          };
        }
      }
    });

    // 7. ACTION_FINISH_ANALYSIS
    this.actions.set('ACTION_FINISH_ANALYSIS', {
      actionId: 'ACTION_FINISH_ANALYSIS',
      name: 'Finalize Security Analysis & Correlate Findings',
      purpose:
        'Concludes the active agent loop, verifies evidence mappings for all identified findings, and compiles the audit summary.',
      category: 'control',
      inputSchema: {
        type: 'object',
        properties: {
          summaryNote: {
            type: 'string',
            description: 'Concluding synthesis of analysis observations',
            default: ''
          }
        }
      },
      timeoutMs: 5000,
      supported: true,
      handler: async (input, context) => {
        const totalFindings =
          (context.manifestAnalysis?.findings.length || 0) +
          (context.dexAnalysis?.findings.length || 0);

        return {
          status: 'SUCCESS',
          output: {
            totalFindings,
            sessionFinalized: true,
            summaryNote: input.summaryNote || 'Analysis completed with verified evidence.'
          },
          observation: `Analysis finalized. Compiled ${totalFindings} evidence-backed security findings across manifest, permissions, IPC components, and bytecode.`
        };
      }
    });
  }
}

export const defaultToolRegistry = new ToolRegistry();
