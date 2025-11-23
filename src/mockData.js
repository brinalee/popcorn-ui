// src/mockData.js

export const channels = [
  {
    id: "sev-incidents",
    label: "sev-incidents",
    iconType: "hash",
    pill: "Production SEV",
    messages: [
      {
        id: "sev-1",
        senderType: "human",
        author: "Brina",
        initials: "B",
        avatarColor: "gray",
        time: "09:41",
        bubbles: [
          "Anyone seeing elevated 500s on api-gateway? Pager just went off."
        ]
      },
      {
        id: "sev-2",
        senderType: "human",
        author: "Tom",
        initials: "T",
        avatarColor: "gray",
        time: "09:42",
        bubbles: [
          "Yep, prod-us-west-2 is flapping. Dashboards show a spike starting right after deploy #428."
        ]
      },
      {
        id: "sev-3",
        senderType: "human",
        author: "Aisha",
        initials: "A",
        avatarColor: "gray",
        time: "09:43",
        bubbles: [
          "Looking at the logs, most errors are on /billing/charge. Could be the currency refactor?"
        ]
      },
      {
        id: "sev-4",
        senderType: "agent",
        author: "XML Agent",
        initials: "A",
        avatarColor: "green",
        agentLabel: "XML AGENT",
        time: "09:44",
        bubbles: [
          "I'm seeing error spikes in deploy #428 around the /billing route. It correlates with this PR in GitHub: https://github.com/kewl/infra-incidents/pull/128"
        ]
      },
      {
        id: "sev-5",
        senderType: "human",
        author: "Devon",
        initials: "D",
        avatarColor: "gray",
        time: "09:45",
        bubbles: [
          "PR 128 changed the retry logic on Stripe timeouts. Maybe we're retrying in a way that double-charges?"
        ]
      },
      {
        id: "sev-6",
        senderType: "human",
        author: "Tom",
        initials: "T",
        avatarColor: "gray",
        time: "09:46",
        bubbles: [
          "Linking another one: https://github.com/kewl/infra-incidents/pull/131 – added a new feature flag `BILLING_STRICT_MODE`."
        ]
      },
      {
        id: "sev-7",
        senderType: "agent",
        author: "XML Agent",
        initials: "A",
        avatarColor: "green",
        agentLabel: "XML AGENT",
        time: "09:47",
        bubbles: [
          "Comparing PR 128 and PR 131: PR 131 enables BILLING_STRICT_MODE by default in production. That flag is only tested in staging. Suggest: roll back PR 131 or flip the flag off."
        ]
      },
      {
        id: "sev-8",
        senderType: "human",
        author: "Aisha",
        initials: "A",
        avatarColor: "gray",
        time: "09:48",
        bubbles: [
          "Agree. I'll toggle BILLING_STRICT_MODE off in prod and watch 500s."
        ]
      },
      {
        id: "sev-9",
        senderType: "human",
        author: "Brina",
        initials: "B",
        avatarColor: "gray",
        time: "09:49",
        bubbles: [
          "On it. Also let's capture a quick timeline in the incident doc; dropping link: https://github.com/kewl/runbooks/blob/main/incidents/2025-11-billing-sev.md"
        ]
      },
      {
        id: "sev-10",
        senderType: "agent",
        author: "XML Agent",
        initials: "A",
        avatarColor: "green",
        agentLabel: "XML AGENT",
        time: "09:50",
        bubbles: [
          "I'll append the current hypothesis and mitigation to the incident doc and pin this thread to #sev-incidents for later review."
        ]
      }
    ]
  },
  {
    id: "ai-news",
    label: "ai-news",
    iconType: "bolt", // "bolt" or "hash"
    pill: "Team updates",
    messages: [
      {
        id: "ai-news-1",
        senderType: "human",
        author: "You",
        initials: "YO",
        avatarColor: "gray",
        isYou: true,
        time: "2m ago",
        bubbles: [
          "Morning! Dropping a recap of yesterday's launches.",
          "We now have Claude doing auto-summaries for the #release-notes channel."
        ]
      },
      {
        id: "ai-news-2",
        senderType: "ai",
        time: "Just now",
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
    messages: [
      {
        id: "all-kewl-1",
        senderType: "human",
        author: "Jordan",
        initials: "J",
        avatarColor: "red",
        time: "1h ago",
        bubbles: ["Donut pairings are back next week 🍩"]
      },
      {
        id: "all-kewl-2",
        senderType: "human",
        author: "Emma",
        initials: "E",
        avatarColor: "green",
        time: "52m ago",
        bubbles: ["Also, posting the offsite photos in this channel later today!"]
      }
    ]
  },
  {
    id: "bug-triaging",
    label: "bug-triaging",
    iconType: "bolt",
    pill: "Incidents",
    messages: [
      {
        id: "bug-1",
        senderType: "human",
        author: "Sarah",
        initials: "S",
        avatarColor: "green",
        time: "2h ago",
        bubbles: ["Great! I'll test it out now 👍"]
      },
      {
        id: "bug-2",
        senderType: "ai",
        time: "2h ago",
        bubbles: [
          "I can help analyze the deployment logs and check for any potential issues.",
          "Would you like me to review the staging environment?"
        ]
      },
      {
        id: "bug-3",
        senderType: "human",
        author: "Sarah",
        initials: "S",
        avatarColor: "green",
        time: "1h 55m ago",
        bubbles: ["Thanks! That would be helpful"]
      },
      {
        id: "bug-4",
        senderType: "human",
        author: "You",
        initials: "YO",
        avatarColor: "gray",
        isYou: true,
        time: "1h 30m ago",
        bubbles: [
          "Everything looks good so far. The new components are rendering perfectly.",
          "The new UI changes are looking really clean."
        ]
      },
      {
        id: "bug-5",
        senderType: "human",
        author: "Sarah",
        initials: "S",
        avatarColor: "green",
        time: "1h 25m ago",
        bubbles: ["Should we merge this now?"]
      },
      {
        id: "bug-6",
        senderType: "human",
        author: "Marcus",
        initials: "M",
        avatarColor: "gray",
        time: "1h 20m ago",
        bubbles: ["Awesome! Ready to merge"]
      },
      {
        id: "bug-7",
        senderType: "ai",
        time: "33m ago",
        bubbles: [
          "Based on the test results, all checks have passed successfully.",
          "The deployment is ready for production."
        ]
      },
      {
        id: "bug-8",
        senderType: "human",
        author: "Sarah",
        initials: "S",
        avatarColor: "green",
        time: "30m ago",
        bubbles: ["Yeah, I think we're good to go 👌"]
      }
    ]
  },
  {
    id: "daily-updates",
    label: "daily-updates",
    iconType: "bolt",
    pill: "Standup",
    messages: [
      {
        id: "daily-1",
        senderType: "human",
        author: "Chris",
        initials: "C",
        avatarColor: "gray",
        time: "Today",
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
    messages: [
      {
        id: "release-1",
        senderType: "human",
        author: "You",
        initials: "YO",
        avatarColor: "gray",
        isYou: true,
        time: "Today",
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
    messages: [
      {
        id: "health-1",
        senderType: "human",
        author: "Jordan",
        initials: "J",
        avatarColor: "red",
        time: "1h ago",
        bubbles: ["shipped to production ✅"]
      },
      {
        id: "health-2",
        senderType: "ai",
        time: "58m ago",
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
    status: "online",
    preview: "I'll push the fix after lunch."
  },
  {
    id: "dm-2",
    name: "Emma, Marcus, Chris, Taylor",
    initials: "E",
    avatarColor: "green",
    status: "online",
    preview: "recapping the bug triage notes now…"
  },
  {
    id: "dm-3",
    name: "Jordan",
    initials: "J",
    avatarColor: "red",
    status: "online",
    preview: "shipped to production ✅"
  },
  {
    id: "dm-4",
    name: "Chris",
    initials: "C",
    avatarColor: "gray",
    status: "away",
    preview: "ping me when logs look clean."
  }
];
