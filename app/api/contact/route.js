export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// POST /api/contact  ->  emails the visitor's note to you via Resend.
// No database, no storage — just a secure server-side send.
export async function POST(request) {
  try {
    const data = await request.json()
    const note = (data.message || '').toString().trim()
    const email = (data.email || '').toString().trim()

    if (!note) {
      return Response.json({ error: 'Write a note first, then send it.' }, { status: 400 })
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'swayamkorde2005@gmail.com'
    const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev'

    if (!RESEND_API_KEY) {
      return Response.json(
        { error: 'Email is not configured yet. Add RESEND_API_KEY to your environment.' },
        { status: 503 }
      )
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Portfolio Contact <${FROM_EMAIL}>`,
        to: [TO_EMAIL],
        reply_to: emailValid ? email : TO_EMAIL,
        subject: 'New note from your portfolio \u2728',
        text: (emailValid ? `From: ${email}\n\n` : '') + note,
        html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#2A1740">${emailValid ? `<p style="margin:0 0 12px;color:#5B4A70">From: <b>${esc(email)}</b></p>` : ''}<p style="margin:0 0 12px;color:#5B4A70">Someone left you a note on your portfolio:</p><blockquote style="margin:0;padding:14px 18px;background:#F5F1FB;border-left:4px solid #6C3FC1;border-radius:8px;white-space:pre-wrap">${esc(note)}</blockquote></div>`,
      }),
    })

    if (!resp.ok) {
      const errText = await resp.text()
      console.error('Resend error:', errText)
      return Response.json(
        { error: 'Could not send the email right now. Please email directly.' },
        { status: 502 }
      )
    }

    return Response.json({ ok: true, sent: true })
  } catch (e) {
    console.error('Contact send failed:', e)
    return Response.json({ error: 'Could not send the email right now.' }, { status: 500 })
  }
}
