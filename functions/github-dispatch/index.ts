import { ServeHandler } from "https://deno.land/std@0.168.0/http/server.ts"

const handler: ServeHandler = async (req) => {
  try {
    // 1. Get the secret GitHub Token from your Supabase Environment Variables
    const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
    if (!GITHUB_TOKEN) {
      return new Response(JSON.stringify({ error: "Missing GITHUB_TOKEN secret" }), { status: 500 });
    }

    // 2. Parse the incoming database webhook payload from Supabase
    const { record, table, type } = await req.json();

    // 3. Construct your custom HTTP body payload for GitHub
    // 'record' contains the exact row data that was just inserted/updated
    const githubPayload = {
      event_type: "database_updated", // GitHub requires this key
      client_payload: {
        action_type: type,         // e.g., "INSERT" or "UPDATE"
        table_name: table,          // e.g., "ngo_project_records"
        project_data: record        // Passes the entire row's data safely as JSON
      }
    };

    // 4. Send the POST request to your GitHub Repository Dispatch API
    const response = await fetch(
      "https://api.github.com/repos/aliulanowar/live-data-visualization/dispatches",
      {
        method: "POST",
        headers: {
          "Accept": "application/vnd.github+json",
          "Authorization": `Bearer ${GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(githubPayload),
      }
    );

    // 5. Handle GitHub's response
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `GitHub API error: ${errorText}` }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, message: "GitHub workflow triggered!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// Start the server listener
// @ts-ignore
Deno.serve(handler);
