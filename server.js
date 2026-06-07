import nodemailer from "nodemailer"

const PORT = process.env.PORT || 3001
const FROM = process.env.SMTP_USER || "jirassamal@gmail.com"
const PASS = process.env.SMTP_PASS
const TO = "jirassamal@gmail.com"

if (!PASS) {
  console.error("Nastav SMTP_PASS (Gmail App Password) jako env proměnnou")
  console.error("https://myaccount.google.com/apppasswords")
  process.exit(1)
}

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: { user: FROM, pass: PASS },
})

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)

    if (req.method === "POST" && url.pathname === "/api/contact") {
      try {
        const body = await req.json()
        const { email, name, message } = body

        const mail = await transport.sendMail({
          from: `"Bike Configurator" <${FROM}>`,
          to: TO,
          subject: `Nová poptávka od ${name}`,
          text: `Jméno: ${name}\nE-mail: ${email}\nZpráva:\n${message}`,
          replyTo: email,
        })

        return new Response(JSON.stringify({ ok: true, id: mail.messageId }), {
          headers: { "Content-Type": "application/json" },
        })
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      }
    }

    if (url.pathname === "/" || url.pathname === "") {
      const file = Bun.file("./index.html")
      return new Response(file, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      })
    }

    return new Response("404", { status: 404 })
  },
})

console.log(`Server běží na http://localhost:${server.port}`)
