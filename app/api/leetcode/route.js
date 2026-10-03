export async function GET() {
  const username = 'Swayam2026';

  try {
    // Fetch submission calendar + solved stats in one call
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
          submissionCalendar
          profile {
            ranking
          }
        }
      }
    `;

    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
      },
      body: JSON.stringify({ query, variables: { username } }),
      next: { revalidate: 21600 }, // cache for 6 hours
    });

    if (!res.ok) {
      throw new Error(`LeetCode API responded with ${res.status}`);
    }

    const json = await res.json();
    const user = json?.data?.matchedUser;

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse the submission calendar (unix-timestamp → count map)
    const calendarRaw = JSON.parse(user.submissionCalendar || '{}');

    // Transform to { "YYYY-MM-DD": count } for the last ~12 months
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const calendar = {};
    for (const [timestamp, count] of Object.entries(calendarRaw)) {
      const date = new Date(parseInt(timestamp) * 1000);
      if (date >= oneYearAgo) {
        const key = date.toISOString().split('T')[0];
        calendar[key] = (calendar[key] || 0) + count;
      }
    }

    // Extract solved counts
    const stats = user.submitStatsGlobal?.acSubmissionNum || [];
    const solved = {
      total: 0,
      easy: 0,
      medium: 0,
      hard: 0,
    };
    for (const s of stats) {
      switch (s.difficulty) {
        case 'All':    solved.total  = s.count; break;
        case 'Easy':   solved.easy   = s.count; break;
        case 'Medium': solved.medium = s.count; break;
        case 'Hard':   solved.hard   = s.count; break;
      }
    }

    return Response.json(
      { calendar, solved, username },
      {
        headers: {
          'Cache-Control':
            'public, max-age=21600, stale-while-revalidate=21600',
        },
      }
    );
  } catch (err) {
    console.error('LeetCode API error:', err);
    return Response.json(
      { error: 'Failed to fetch LeetCode data' },
      { status: 500 }
    );
  }
}
