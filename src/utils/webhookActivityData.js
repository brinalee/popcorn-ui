// src/utils/webhookActivityData.js

// Mock GitHub Actions workflow_job payload
const GITHUB_WORKFLOW_PAYLOAD = {
  action: "completed",
  workflow_job: {
    id: 56503161213,
    run_id: 14532942131,
    workflow_name: "Main Branch Tests and Coverage",
    head_branch: "main",
    run_url: "https://api.github.com/repos/acme-corp/chiral-monorepo-backend/actions/runs/14532942131",
    run_attempt: 1,
    node_id: "CR_kwDOMNjEgs8AAAAN4wZHbQ",
    head_sha: "5c1f75b9d85c24e67c1b93ed0e2ae02c72ce7e5d",
    url: "https://api.github.com/repos/acme-corp/chiral-monorepo-backend/actions/jobs/56503161213",
    html_url: "https://github.com/acme-corp/chiral-monorepo-backend/actions/runs/14532942131/job/56503161213",
    status: "completed",
    conclusion: "success",
    created_at: "2025-11-27T00:14:10Z",
    started_at: "2025-11-27T00:14:17Z",
    completed_at: "2025-11-27T00:15:47Z",
    name: "Trigger Deployment / Build and Deploy to ECS",
    steps: [
      {
        name: "Set up job",
        status: "completed",
        conclusion: "success",
        number: 1,
        started_at: "2025-11-27T00:14:16Z",
        completed_at: "2025-11-27T00:14:18Z"
      },
      {
        name: "Checkout code",
        status: "completed",
        conclusion: "success",
        number: 2,
        started_at: "2025-11-27T00:14:18Z",
        completed_at: "2025-11-27T00:14:22Z"
      },
      {
        name: "Build Docker image",
        status: "completed",
        conclusion: "success",
        number: 3,
        started_at: "2025-11-27T00:14:22Z",
        completed_at: "2025-11-27T00:15:10Z"
      },
      {
        name: "Push to ECR",
        status: "completed",
        conclusion: "success",
        number: 4,
        started_at: "2025-11-27T00:15:10Z",
        completed_at: "2025-11-27T00:15:35Z"
      },
      {
        name: "Deploy to ECS",
        status: "completed",
        conclusion: "success",
        number: 5,
        started_at: "2025-11-27T00:15:35Z",
        completed_at: "2025-11-27T00:15:45Z"
      }
    ],
    check_run_url: "https://api.github.com/repos/acme-corp/chiral-monorepo-backend/check-runs/56503161213",
    labels: ["ubuntu-latest"],
    runner_id: 15,
    runner_name: "GitHub Actions 15",
    runner_group_id: 2,
    runner_group_name: "GitHub Actions"
  },
  repository: {
    id: 842957234,
    node_id: "R_kgDOMNjEsg",
    name: "chiral-monorepo-backend",
    full_name: "acme-corp/chiral-monorepo-backend",
    private: true,
    html_url: "https://github.com/acme-corp/chiral-monorepo-backend",
    description: "Backend services monorepo",
    fork: false,
    default_branch: "main"
  },
  organization: {
    login: "acme-corp",
    id: 12345678,
    node_id: "O_kgDOAB0BZg",
    url: "https://api.github.com/orgs/acme-corp",
    avatar_url: "https://avatars.githubusercontent.com/u/12345678?v=4"
  },
  sender: {
    login: "github-actions[bot]",
    id: 41898282,
    node_id: "MDM6Qm90NDE4OTgyODI=",
    avatar_url: "https://avatars.githubusercontent.com/in/15368?v=4",
    type: "Bot"
  }
};

// Generate mock events for a webhook
export function getWebhookEvents(webhookId) {
  return [
    {
      id: `evt_${webhookId}_1`,
      webhookId,
      receivedAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 min ago
      source: "GitHub Actions",
      status: "success",
      title: "Main Branch Tests and Coverage — success",
      subtitle: "Trigger Deployment / Build and Deploy to ECS · chiral-monorepo-backend",
      payload: GITHUB_WORKFLOW_PAYLOAD,
    },
    {
      id: `evt_${webhookId}_2`,
      webhookId,
      receivedAt: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 hours ago
      source: "GitHub Actions",
      status: "failed",
      title: "Main Branch Tests and Coverage — failed",
      subtitle: "Run tests · chiral-monorepo-backend",
      payload: {
        ...GITHUB_WORKFLOW_PAYLOAD,
        workflow_job: {
          ...GITHUB_WORKFLOW_PAYLOAD.workflow_job,
          conclusion: "failure",
          name: "Run tests",
          steps: [
            ...GITHUB_WORKFLOW_PAYLOAD.workflow_job.steps.slice(0, 2),
            {
              name: "Run unit tests",
              status: "completed",
              conclusion: "failure",
              number: 3,
              started_at: "2025-11-26T21:14:22Z",
              completed_at: "2025-11-26T21:15:10Z"
            }
          ]
        }
      },
    },
    {
      id: `evt_${webhookId}_3`,
      webhookId,
      receivedAt: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 day ago
      source: "GitHub Actions",
      status: "success",
      title: "Deploy to Production — success",
      subtitle: "Production deployment · chiral-monorepo-backend",
      payload: {
        ...GITHUB_WORKFLOW_PAYLOAD,
        workflow_job: {
          ...GITHUB_WORKFLOW_PAYLOAD.workflow_job,
          workflow_name: "Deploy to Production",
          name: "Production deployment",
        }
      },
    },
    {
      id: `evt_${webhookId}_4`,
      webhookId,
      receivedAt: new Date(Date.now() - 48 * 3600000).toISOString(), // 2 days ago
      source: "GitHub Actions",
      status: "success",
      title: "Main Branch Tests and Coverage — success",
      subtitle: "Trigger Deployment / Build and Deploy to ECS · chiral-monorepo-backend",
      payload: GITHUB_WORKFLOW_PAYLOAD,
    },
  ];
}

export function formatRelativeTime(iso) {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH} hr${diffH === 1 ? "" : "s"} ago`;
  const diffD = Math.round(diffH / 24);
  return `${diffD} day${diffD === 1 ? "" : "s"} ago`;
}
