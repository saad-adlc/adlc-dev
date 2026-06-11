import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const server = new Server(
  { name: "github-enterprise", version: "2.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // ── Existing ──────────────────────────────────────────────────────────────
    {
      name: "search_code",
      description: "Search code across GitHub repos",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          org: { type: "string", description: "Limit to this org" },
        },
        required: ["query"],
      },
    },
    {
      name: "get_pr",
      description: "Get a pull request and its diff",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string" },
          repo: { type: "string" },
          pr_number: { type: "number" },
        },
        required: ["owner", "repo", "pr_number"],
      },
    },
    {
      name: "list_issues",
      description: "List issues in a repo",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string" },
          repo: { type: "string" },
          state: { type: "string", enum: ["open", "closed", "all"] },
        },
        required: ["owner", "repo"],
      },
    },
    {
      name: "create_comment",
      description: "Post a comment on an issue or PR",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string" },
          repo: { type: "string" },
          issue_number: { type: "number" },
          body: { type: "string" },
        },
        required: ["owner", "repo", "issue_number", "body"],
      },
    },

    // ── Files ─────────────────────────────────────────────────────────────────
    {
      name: "get_file_contents",
      description: "Read a file from a GitHub repo",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string" },
          repo: { type: "string" },
          path: { type: "string", description: "File path in the repo" },
          ref: { type: "string", description: "Branch, tag, or commit SHA (default: repo default branch)" },
        },
        required: ["owner", "repo", "path"],
      },
    },
    {
      name: "create_or_update_file",
      description: "Create or update a single file in a repo (commits directly to a branch)",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string" },
          repo: { type: "string" },
          path: { type: "string", description: "File path in the repo" },
          message: { type: "string", description: "Commit message" },
          content: { type: "string", description: "File content (plain text, will be base64-encoded)" },
          branch: { type: "string", description: "Target branch (default: repo default branch)" },
          sha: { type: "string", description: "Required when updating an existing file — the blob SHA of the file being replaced" },
        },
        required: ["owner", "repo", "path", "message", "content"],
      },
    },
    {
      name: "list_repo_contents",
      description: "List files and directories at a path in a repo",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string" },
          repo: { type: "string" },
          path: { type: "string", description: "Directory path (default: repo root)" },
          ref: { type: "string", description: "Branch, tag, or commit SHA" },
        },
        required: ["owner", "repo"],
      },
    },

    // ── Branches ──────────────────────────────────────────────────────────────
    {
      name: "list_branches",
      description: "List branches in a repo",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      },
    },
    {
      name: "create_branch",
      description: "Create a new branch from an existing branch or SHA",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string", description: "Name of the new branch" },
          from_branch: { type: "string", description: "Branch or SHA to create from (default: repo default branch)" },
        },
        required: ["owner", "repo", "branch"],
      },
    },

    // ── Pull Requests ─────────────────────────────────────────────────────────
    {
      name: "create_pull_request",
      description: "Open a new pull request",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string" },
          repo: { type: "string" },
          title: { type: "string" },
          body: { type: "string", description: "PR description" },
          head: { type: "string", description: "Branch containing changes" },
          base: { type: "string", description: "Branch to merge into" },
          draft: { type: "boolean", description: "Open as draft PR" },
        },
        required: ["owner", "repo", "title", "head", "base"],
      },
    },
    {
      name: "list_pull_requests",
      description: "List pull requests in a repo",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string" },
          repo: { type: "string" },
          state: { type: "string", enum: ["open", "closed", "all"] },
          base: { type: "string", description: "Filter by base branch" },
        },
        required: ["owner", "repo"],
      },
    },
    {
      name: "merge_pull_request",
      description: "Merge a pull request",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string" },
          repo: { type: "string" },
          pr_number: { type: "number" },
          merge_method: { type: "string", enum: ["merge", "squash", "rebase"], description: "Default: merge" },
          commit_message: { type: "string" },
        },
        required: ["owner", "repo", "pr_number"],
      },
    },

    // ── Issues ────────────────────────────────────────────────────────────────
    {
      name: "create_issue",
      description: "Create a new issue",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string" },
          repo: { type: "string" },
          title: { type: "string" },
          body: { type: "string" },
          labels: { type: "array", items: { type: "string" } },
          assignees: { type: "array", items: { type: "string" } },
        },
        required: ["owner", "repo", "title"],
      },
    },

    // ── Commits ───────────────────────────────────────────────────────────────
    {
      name: "list_commits",
      description: "List commits on a branch",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string" },
          repo: { type: "string" },
          sha: { type: "string", description: "Branch name or commit SHA (default: repo default branch)" },
          per_page: { type: "number", description: "Number of commits to return (default: 20)" },
        },
        required: ["owner", "repo"],
      },
    },

    // ── Repo ──────────────────────────────────────────────────────────────────
    {
      name: "get_repo",
      description: "Get metadata about a repository",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      },
    },
    {
      name: "list_repos",
      description: "List repositories for a user or org",
      inputSchema: {
        type: "object",
        properties: {
          owner: { type: "string", description: "User or org name" },
          type: { type: "string", enum: ["all", "public", "private", "forks", "sources"], description: "Default: all" },
        },
        required: ["owner"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // ── Existing ───────────────────────────────────────────────────────────────

  if (name === "search_code") {
    const q = args.org ? `${args.query} org:${args.org}` : args.query;
    const { data } = await octokit.search.code({ q, per_page: 10 });
    return {
      content: [{
        type: "text",
        text: JSON.stringify(data.items.map(i => ({
          path: i.path, repo: i.repository.full_name, url: i.html_url,
        })), null, 2),
      }],
    };
  }

  if (name === "get_pr") {
    const [{ data: pr }, { data: files }] = await Promise.all([
      octokit.pulls.get({ owner: args.owner, repo: args.repo, pull_number: args.pr_number }),
      octokit.pulls.listFiles({ owner: args.owner, repo: args.repo, pull_number: args.pr_number }),
    ]);
    return {
      content: [{
        type: "text",
        text: `PR #${pr.number}: ${pr.title}\n\n${pr.body ?? ""}\n\nFiles changed:\n${
          files.map(f => `  ${f.status.padEnd(8)} ${f.filename}`).join("\n")
        }`,
      }],
    };
  }

  if (name === "list_issues") {
    const { data } = await octokit.issues.listForRepo({
      owner: args.owner, repo: args.repo,
      state: args.state ?? "open",
      per_page: 20,
    });
    return {
      content: [{
        type: "text",
        text: data.map(i => `#${i.number} [${i.state}] ${i.title}`).join("\n"),
      }],
    };
  }

  if (name === "create_comment") {
    await octokit.issues.createComment({
      owner: args.owner, repo: args.repo,
      issue_number: args.issue_number, body: args.body,
    });
    return { content: [{ type: "text", text: "Comment posted." }] };
  }

  // ── Files ──────────────────────────────────────────────────────────────────

  if (name === "get_file_contents") {
    const { data } = await octokit.repos.getContent({
      owner: args.owner, repo: args.repo,
      path: args.path,
      ...(args.ref ? { ref: args.ref } : {}),
    });
    if (Array.isArray(data)) {
      return {
        content: [{
          type: "text",
          text: data.map(f => `${f.type.padEnd(4)} ${f.name}`).join("\n"),
        }],
      };
    }
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return {
      content: [{
        type: "text",
        text: `// ${data.path} (sha: ${data.sha})\n\n${content}`,
      }],
    };
  }

  if (name === "create_or_update_file") {
    const content = Buffer.from(args.content, "utf-8").toString("base64");
    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner: args.owner, repo: args.repo,
      path: args.path,
      message: args.message,
      content,
      ...(args.branch ? { branch: args.branch } : {}),
      ...(args.sha ? { sha: args.sha } : {}),
    });
    return {
      content: [{
        type: "text",
        text: `File ${data.content.path} committed.\nCommit: ${data.commit.sha}\nURL: ${data.content.html_url}`,
      }],
    };
  }

  if (name === "list_repo_contents") {
    const { data } = await octokit.repos.getContent({
      owner: args.owner, repo: args.repo,
      path: args.path ?? "",
      ...(args.ref ? { ref: args.ref } : {}),
    });
    const items = Array.isArray(data) ? data : [data];
    return {
      content: [{
        type: "text",
        text: items.map(f => `${f.type.padEnd(4)} ${f.name}`).join("\n"),
      }],
    };
  }

  // ── Branches ───────────────────────────────────────────────────────────────

  if (name === "list_branches") {
    const { data } = await octokit.repos.listBranches({
      owner: args.owner, repo: args.repo, per_page: 50,
    });
    return {
      content: [{
        type: "text",
        text: data.map(b => `${b.name} (${b.commit.sha.slice(0, 7)})`).join("\n"),
      }],
    };
  }

  if (name === "create_branch") {
    // Resolve the SHA to branch from
    let sha = args.from_branch;
    if (!sha || !sha.match(/^[0-9a-f]{40}$/i)) {
      const fromRef = args.from_branch ?? (await octokit.repos.get({ owner: args.owner, repo: args.repo })).data.default_branch;
      const { data: ref } = await octokit.git.getRef({
        owner: args.owner, repo: args.repo,
        ref: `heads/${fromRef}`,
      });
      sha = ref.object.sha;
    }
    await octokit.git.createRef({
      owner: args.owner, repo: args.repo,
      ref: `refs/heads/${args.branch}`,
      sha,
    });
    return { content: [{ type: "text", text: `Branch '${args.branch}' created from ${sha.slice(0, 7)}.` }] };
  }

  // ── Pull Requests ──────────────────────────────────────────────────────────

  if (name === "create_pull_request") {
    const { data: pr } = await octokit.pulls.create({
      owner: args.owner, repo: args.repo,
      title: args.title,
      body: args.body ?? "",
      head: args.head,
      base: args.base,
      draft: args.draft ?? false,
    });
    return {
      content: [{
        type: "text",
        text: `PR #${pr.number} created: ${pr.title}\n${pr.html_url}`,
      }],
    };
  }

  if (name === "list_pull_requests") {
    const { data } = await octokit.pulls.list({
      owner: args.owner, repo: args.repo,
      state: args.state ?? "open",
      base: args.base,
      per_page: 20,
    });
    return {
      content: [{
        type: "text",
        text: data.map(p => `#${p.number} [${p.state}] ${p.title} (${p.head.ref} → ${p.base.ref})`).join("\n"),
      }],
    };
  }

  if (name === "merge_pull_request") {
    const { data } = await octokit.pulls.merge({
      owner: args.owner, repo: args.repo,
      pull_number: args.pr_number,
      merge_method: args.merge_method ?? "merge",
      commit_message: args.commit_message,
    });
    return { content: [{ type: "text", text: data.message }] };
  }

  // ── Issues ─────────────────────────────────────────────────────────────────

  if (name === "create_issue") {
    const { data: issue } = await octokit.issues.create({
      owner: args.owner, repo: args.repo,
      title: args.title,
      body: args.body,
      labels: args.labels,
      assignees: args.assignees,
    });
    return {
      content: [{
        type: "text",
        text: `Issue #${issue.number} created: ${issue.title}\n${issue.html_url}`,
      }],
    };
  }

  // ── Commits ────────────────────────────────────────────────────────────────

  if (name === "list_commits") {
    const { data } = await octokit.repos.listCommits({
      owner: args.owner, repo: args.repo,
      sha: args.sha,
      per_page: args.per_page ?? 20,
    });
    return {
      content: [{
        type: "text",
        text: data.map(c =>
          `${c.sha.slice(0, 7)} ${c.commit.author.date.slice(0, 10)} ${c.commit.message.split("\n")[0]}`
        ).join("\n"),
      }],
    };
  }

  // ── Repo ───────────────────────────────────────────────────────────────────

  if (name === "get_repo") {
    const { data: r } = await octokit.repos.get({ owner: args.owner, repo: args.repo });
    return {
      content: [{
        type: "text",
        text: [
          `${r.full_name} — ${r.description ?? "no description"}`,
          `Default branch: ${r.default_branch}`,
          `Stars: ${r.stargazers_count}  Forks: ${r.forks_count}  Open issues: ${r.open_issues_count}`,
          `URL: ${r.html_url}`,
        ].join("\n"),
      }],
    };
  }

  if (name === "list_repos") {
    const { data } = await octokit.repos.listForOrg({
      org: args.owner,
      type: args.type ?? "all",
      per_page: 50,
    }).catch(() =>
      octokit.repos.listForUser({ username: args.owner, type: args.type ?? "all", per_page: 50 })
    );
    return {
      content: [{
        type: "text",
        text: data.map(r => `${r.name} (${r.visibility ?? r.private ? "private" : "public"})`).join("\n"),
      }],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);