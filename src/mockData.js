// src/mockData.js

export const channels = [
  {
    id: "sev-incidents",
    label: "sev-incidents",
    iconType: "hash",
    pill: "Production SEV",
    managerId: "marcus",
    managerName: "Marcus Chen",
    messages: [
      {
        id: "sev-1",
        senderType: "human",
        author: "oguz",
        initials: "O",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=12",
        timestamp: "2025-11-24T09:15:00Z",
        bubbles: [
          "Seeing a spike in 500s on the `/login` endpoint.\n\nHere's the handler we just deployed:\n\n```ts\nexport async function loginHandler(req: Request): Promise<Response> {\n  const { email, password } = await req.json();\n\n  const user = await db.user.findUnique({ where: { email } });\n  if (!user) {\n    return new Response(\"Invalid credentials\", { status: 401 });\n  }\n\n  const ok = await verifyPassword(password, user.hashedPassword);\n  if (!ok) {\n    return new Response(\"Invalid credentials\", { status: 401 });\n  }\n\n  return redirect(\"/home\");\n}\n```"
        ]
      },
      {
        id: "sev-2",
        senderType: "human",
        author: "You",
        initials: "YO",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=68",
        isYou: true,
        timestamp: "2025-11-24T09:17:00Z",
        bubbles: [
          "The handler itself looks fine. I think the issue is upstream.\n\nCan you log the body we get back from the auth service?\n\n```ts\nconst resp = await fetch(authUrl, { method: \"POST\", body: JSON.stringify(payload) });\n\nif (!resp.ok) {\n  console.error(\"Auth service failed\", {\n    status: resp.status,\n    body: await resp.text(),\n  });\n  return new Response(\"Auth service error\", { status: 502 });\n}\n```"
        ]
      },
      {
        id: "sev-3",
        senderType: "human",
        author: "oguz",
        initials: "O",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=12",
        timestamp: "2025-11-24T09:20:00Z",
        bubbles: [
          "Yep, looks like we're not handling timeouts.\n\n```ts\nconst controller = new AbortController();\nconst timeout = setTimeout(() => controller.abort(), 5_000);\n\ntry {\n  const resp = await fetch(authUrl, {\n    method: \"POST\",\n    signal: controller.signal,\n    body: JSON.stringify(payload),\n  });\n  // ...\n} catch (err) {\n  if (err.name === \"AbortError\") {\n    return new Response(\"Auth service timeout\", { status: 504 });\n  }\n  throw err;\n}\n```\n\nLet's hotfix this and redeploy."
        ]
      }
    ]
  },
  {
    id: "ai-news",
    label: "ai-news",
    iconType: "bolt", // "bolt" or "hash"
    pill: "Team updates",
    managerId: "emma",
    managerName: "Emma Wilson",
    messages: [
      {
        id: "ai-news-1",
        senderType: "human",
        author: "You",
        initials: "YO",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=68",
        isYou: true,
        time: "10:48am",
        bubbles: [
          "Morning! Dropping a recap of yesterday's launches.",
          "We now have Claude doing auto-summaries for the #release-notes channel."
        ]
      },
      {
        id: "ai-news-2",
        senderType: "ai",
        time: "10:50am",
        bubbles: [
          "I've indexed the last 24 hours of launch notes.",
          "Ask me about any specific service and I'll pull the highlights."
        ]
      }
    ]
  },
  {
    id: "all-kewl",
    label: "all-kewl",
    iconType: "hash",
    pill: "Company-wide",
    managerId: "jordan",
    managerName: "Jordan Lee",
    messages: [
      {
        id: "all-kewl-1",
        senderType: "human",
        author: "Jordan",
        initials: "J",
        avatarColor: "red",
        avatarUrl: "https://i.pravatar.cc/150?img=15",
        time: "9:15am",
        bubbles: ["Donut pairings are back next week 🍩"]
      },
      {
        id: "all-kewl-2",
        senderType: "human",
        author: "Emma",
        initials: "E",
        avatarColor: "green",
        avatarUrl: "https://i.pravatar.cc/150?img=47",
        time: "9:23am",
        bubbles: ["Also, posting the offsite photos in this channel later today!"]
      }
    ]
  },
  {
    id: "bug-triaging",
    label: "bug-triaging",
    iconType: "bolt",
    pill: "Incidents",
    managerId: "marcus",
    managerName: "Marcus Chen",
    messages: [
      {
        id: "bug-1",
        senderType: "human",
        author: "You",
        initials: "YO",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=68",
        isYou: true,
        timestamp: "2024-11-20T12:29:00Z",
        bubbles: ["@shaun @oguz seems like conversations are broken"],
        replySummary: {
          threadId: "thread-bug-1",
          replyCount: 5,
          lastReplyAt: "2025-06-15T12:38:00Z",
          participantAvatarUrls: [
            "https://i.pravatar.cc/150?img=14",
            "https://i.pravatar.cc/150?img=33",
            "https://i.pravatar.cc/150?img=47"
          ]
        }
      },
      {
        id: "bug-2",
        senderType: "ai",
        timestamp: "2024-11-20T12:29:00Z",
        bubbles: ["was added to #all-eng by ben."]
      },
      {
        id: "bug-3",
        senderType: "human",
        author: "You",
        initials: "YO",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=68",
        isYou: true,
        timestamp: "2024-11-20T12:30:00Z",
        bubbles: ["Maybe my fault?"]
      },
      {
        id: "bug-4",
        senderType: "human",
        author: "oguz",
        initials: "O",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=14",
        timestamp: "2024-11-20T12:30:00Z",
        bubbles: [
          "ah maybe I didn't communicate that merging a PR auto deploys",
          "so Shaun hasn't run the migration yet probably",
          "yeah that's the case. @shaun you around or I can run the migration?"
        ],
        replySummary: {
          threadId: "thread-bug-4",
          replyCount: 3,
          lastReplyAt: "2025-06-15T12:45:00Z",
          participantAvatarUrls: [
            "https://i.pravatar.cc/150?img=68",
            "https://i.pravatar.cc/150?img=14",
            "https://i.pravatar.cc/150?img=33"
          ]
        }
      },
      {
        id: "bug-5",
        senderType: "human",
        author: "You",
        initials: "YO",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=68",
        isYou: true,
        timestamp: "2024-11-20T12:33:00Z",
        bubbles: ["Ah I see"]
      },
      {
        id: "bug-6",
        senderType: "human",
        author: "You",
        initials: "YO",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=68",
        isYou: true,
        timestamp: "2024-11-20T12:41:00Z",
        bubbles: ["oguz migrated service back!"]
      },
      {
        id: "bug-7",
        senderType: "human",
        author: "oguz",
        initials: "O",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=14",
        timestamp: "2024-11-20T12:41:00Z",
        bubbles: ["yeah it is just one command anyways 😁"]
      },
      {
        id: "bug-8",
        senderType: "human",
        author: "You",
        initials: "YO",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=68",
        isYou: true,
        time: "12:41pm",
        bubbles: ["yeah"]
      },
      {
        id: "bug-9",
        senderType: "human",
        author: "oguz",
        initials: "O",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=14",
        time: "12:41pm",
        bubbles: ["sorry my bad, should've communicated the continuous deployment"]
      },
      {
        id: "bug-10",
        senderType: "ai",
        time: "12:42pm",
        bubbles: [
          "Oh hey, just seeing this now. I pushed up the new image but haven't deployed it yet, was just about to!",
          "I'd like to try running the migration if it hasn't been done yet @oguz"
        ]
      },
      {
        id: "bug-11",
        senderType: "human",
        author: "oguz",
        initials: "O",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=14",
        time: "12:43pm",
        bubbles: ["sorry I just did 😔"]
      },
      {
        id: "bug-12",
        senderType: "human",
        author: "You",
        initials: "YO",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=68",
        isYou: true,
        time: "12:43pm",
        bubbles: ["yeah service was broken for 10 mins"]
      },
      {
        id: "bug-13",
        senderType: "ai",
        time: "12:44pm",
        bubbles: [
          "ah maybe I didn't communicate that merging a PR auto deploys",
          "Oh, yeah that'll do it",
          "no prob (edited)"
        ]
      },
      {
        id: "bug-14",
        senderType: "human",
        author: "oguz",
        initials: "O",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=14",
        time: "12:44pm",
        bubbles: ["yeah it basically pushed the new image and deployed automatically"]
      },
      {
        id: "bug-action-1",
        senderType: "ai",
        messageType: "action",
        time: "12:46pm",
        action: {
          type: "linear_task_created",
          title: "Fix timeout handling in auth service",
          url: "https://linear.app/acme/issue/ENG-1234"
        },
        permissionContext: {
          type: "channel",
          channelId: "bug-triaging",
          managerName: "Marcus Chen"
        }
      },
      {
        id: "bug-perm-1",
        senderType: "ai",
        messageType: "permission_request",
        time: "12:48pm",
        requestedSource: {
          id: "github",
          name: "GitHub",
          icon: "🐙",
          scopes: ["read_repos", "create_issues"]
        },
        reason: "I need access to GitHub to create an issue for tracking this bug."
      }
    ]
  },
  {
    id: "daily-updates",
    label: "daily-updates",
    iconType: "bolt",
    pill: "Standup",
    managerId: "chris",
    managerName: "Chris Taylor",
    messages: [
      {
        id: "daily-1",
        senderType: "human",
        author: "Chris",
        initials: "C",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=14",
        time: "9:00am",
        bubbles: [
          "Yesterday: finished refactor of the logging pipeline.",
          "Today: pairing with Taylor on the new alerting rules."
        ]
      }
    ]
  },
  {
    id: "release-notes",
    label: "release-notes",
    iconType: "bolt",
    pill: "Changelog",
    managerId: "marcus",
    managerName: "Marcus Chen",
    messages: [
      {
        id: "release-1",
        senderType: "human",
        author: "You",
        initials: "YO",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=68",
        isYou: true,
        time: "10:30am",
        bubbles: [
          "v0.14.0 is live:",
          "• New Claude-powered bug triage helper\n• Improved DM presence indicators"
        ]
      }
    ]
  },
  {
    id: "service-health",
    label: "service-health",
    iconType: "bolt",
    pill: "Status",
    managerId: "jordan",
    managerName: "Jordan Lee",
    messages: [
      {
        id: "health-1",
        senderType: "human",
        author: "Jordan",
        initials: "J",
        avatarColor: "red",
        avatarUrl: "https://i.pravatar.cc/150?img=15",
        time: "2:30pm",
        bubbles: ["shipped to production ✅"]
      },
      {
        id: "health-2",
        senderType: "ai",
        time: "2:32pm",
        bubbles: [
          "All regions are healthy. P95 latency is trending slightly down after the deploy."
        ]
      }
    ]
  }
];

export const dms = [
  {
    id: "dm-1",
    name: "Marcus, Alex",
    initials: "M",
    avatarColor: "gray",
    avatarUrl: "https://i.pravatar.cc/150?img=60",
    status: "online",
    preview: "I'll push the fix after lunch."
  },
  {
    id: "dm-2",
    name: "Emma, Marcus, Chris, Taylor",
    initials: "E",
    avatarColor: "green",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
    status: "online",
    preview: "recapping the bug triage notes now…"
  },
  {
    id: "dm-3",
    name: "Jordan",
    initials: "J",
    avatarColor: "red",
    avatarUrl: "https://i.pravatar.cc/150?img=15",
    status: "online",
    preview: "shipped to production ✅"
  },
  {
    id: "dm-4",
    name: "Chris",
    initials: "C",
    avatarColor: "gray",
    avatarUrl: "https://i.pravatar.cc/150?img=14",
    status: "away",
    preview: "ping me when logs look clean."
  }
];

// Thread data
export const threads = [
  {
    id: "thread-bug-1",
    channelId: "bug-triaging",
    rootMessageId: "bug-1",
    messages: [
      {
        id: "thread-bug-1-reply-1",
        senderType: "human",
        author: "Shaun",
        initials: "S",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=33",
        time: "12:30pm",
        bubbles: ["Yeah I saw that too. Let me check the deployment logs."]
      },
      {
        id: "thread-bug-1-reply-2",
        senderType: "human",
        author: "Marcus",
        initials: "M",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=14",
        time: "12:32pm",
        bubbles: ["Looks like the migration didn't run. That's why conversations are throwing errors."]
      },
      {
        id: "thread-bug-1-reply-3",
        senderType: "human",
        author: "You",
        initials: "YO",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=68",
        isYou: true,
        time: "12:35pm",
        bubbles: ["Should we rollback or just run the migration?"]
      },
      {
        id: "thread-bug-1-reply-4",
        senderType: "human",
        author: "Emma",
        initials: "E",
        avatarColor: "green",
        avatarUrl: "https://i.pravatar.cc/150?img=47",
        time: "12:37pm",
        bubbles: ["Run the migration, the code changes are good."]
      },
      {
        id: "thread-bug-1-reply-5",
        senderType: "human",
        author: "Shaun",
        initials: "S",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=33",
        time: "12:38pm",
        bubbles: ["On it now 👍"]
      }
    ]
  },
  {
    id: "thread-bug-4",
    channelId: "bug-triaging",
    rootMessageId: "bug-4",
    messages: [
      {
        id: "thread-bug-4-reply-1",
        senderType: "human",
        author: "You",
        initials: "YO",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=68",
        isYou: true,
        time: "12:40pm",
        bubbles: ["No worries, I can wait!"]
      },
      {
        id: "thread-bug-4-reply-2",
        senderType: "human",
        author: "Shaun",
        initials: "S",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=33",
        time: "12:43pm",
        bubbles: ["Thanks for understanding. Migration is running now."]
      },
      {
        id: "thread-bug-4-reply-3",
        senderType: "human",
        author: "Marcus",
        initials: "M",
        avatarColor: "gray",
        avatarUrl: "https://i.pravatar.cc/150?img=14",
        time: "12:45pm",
        bubbles: ["All good now! Conversations are working again."]
      }
    ]
  }
];
