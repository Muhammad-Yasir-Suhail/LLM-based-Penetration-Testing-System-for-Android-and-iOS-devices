import { TeamMember } from "@/types";

export const initialTeamMembers: TeamMember[] = [
  {
    id: "user-1",
    name: "Alex Vance",
    email: "alex.vance@sentinelx.security",
    role: "Owner",
    status: "Active",
    lastActive: "Just now",
    projectsAssigned: ["Acme Banking", "ShopSphere", "SecureAuth Mobile"],
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
  },
  {
    id: "user-2",
    name: "Sarah Jenkins",
    email: "sarah.j@sentinelx.security",
    role: "Admin",
    status: "Active",
    lastActive: "5 mins ago",
    projectsAssigned: ["Acme Banking", "SecureAuth Mobile", "HealthTrack"],
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
  },
  {
    id: "user-3",
    name: "Marcus Chen",
    email: "m.chen@shopsphere.io",
    role: "Security Analyst",
    status: "Active",
    lastActive: "22 mins ago",
    projectsAssigned: ["ShopSphere"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
  },
  {
    id: "user-4",
    name: "Elena Rostova",
    email: "elena.r@healthtrack.med",
    role: "Security Analyst",
    status: "Active",
    lastActive: "1 hour ago",
    projectsAssigned: ["HealthTrack", "Acme Banking"],
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80"
  },
  {
    id: "user-5",
    name: "David Kim",
    email: "david.kim@transitgo.io",
    role: "Developer",
    status: "Active",
    lastActive: "2 hours ago",
    projectsAssigned: ["TransitGo"],
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
  },
  {
    id: "user-6",
    name: "Tariq Mansoor",
    email: "tariq@vaulttech.crypto",
    role: "Security Analyst",
    status: "Active",
    lastActive: "Yesterday",
    projectsAssigned: ["CryptoVault Pro"],
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80"
  },
  {
    id: "user-7",
    name: "Liam O'Connor",
    email: "liam.oc@freighthub.logistics",
    role: "Developer",
    status: "Active",
    lastActive: "3 days ago",
    projectsAssigned: ["FleetLogistics Driver"],
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80"
  },
  {
    id: "user-8",
    name: "Aisha Patel",
    email: "aisha.patel@nexhome.io",
    role: "Developer",
    status: "Active",
    lastActive: "4 days ago",
    projectsAssigned: ["SmartHome Hub"],
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
  }
];
