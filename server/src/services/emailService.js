import nodemailer from 'nodemailer';

const { EMAIL_USER, EMAIL_PASS } = process.env;

const transporter = EMAIL_USER && EMAIL_PASS && !EMAIL_USER.startsWith('adresa_')
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    })
  : null;

export const sendExpiryWarningEmail = async ({ toEmail, toName, listingTitle, daysLeft }) => {
  if (!transporter) return;
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
  try {
    await transporter.sendMail({
      from: `"AutoMarket" <${EMAIL_USER}>`,
      to: toEmail,
      subject: `Anunțul tău expiră în ${daysLeft} zile — ${listingTitle}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
          <h2 style="color:#d97706">⚠️ Anunțul tău expiră în curând</h2>
          <p>Salut <strong>${toName}</strong>,</p>
          <p>Anunțul <strong>${listingTitle}</strong> va expira în <strong>${daysLeft} zile</strong> și nu va mai fi vizibil cumpărătorilor.</p>
          <a href="${CLIENT_URL}/my-listings" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:12px">
            Reînnoiește anunțul →
          </a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">AutoMarket — piața auto din România</p>
        </div>`,
    });
  } catch (err) {
    console.error('[email] Expiry warning failed:', err.message);
  }
};

export const sendListingExpiredEmail = async ({ toEmail, toName, listingTitle }) => {
  if (!transporter) return;
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
  try {
    await transporter.sendMail({
      from: `"AutoMarket" <${EMAIL_USER}>`,
      to: toEmail,
      subject: `Anunțul tău a expirat — ${listingTitle}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
          <h2 style="color:#dc2626">Anunțul tău a expirat</h2>
          <p>Salut <strong>${toName}</strong>,</p>
          <p>Anunțul <strong>${listingTitle}</strong> a expirat și a fost dezactivat automat.</p>
          <p>Îl poți reactiva oricând din secțiunea "Anunțurile mele" — un click și rămâi activ încă 60 de zile.</p>
          <a href="${CLIENT_URL}/my-listings" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:12px">
            Reactivează anunțul →
          </a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">AutoMarket — piața auto din România</p>
        </div>`,
    });
  } catch (err) {
    console.error('[email] Expiry notification failed:', err.message);
  }
};

export const sendSavedSearchAlert = async ({ toEmail, toName, searchName, listings }) => {
  if (!transporter) return;
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
  const listingsHtml = listings.map((l) => `
    <a href="${CLIENT_URL}/listings/${l.id}" style="display:block;padding:10px 0;border-bottom:1px solid #e2e8f0;text-decoration:none;color:inherit">
      <strong style="color:#1e40af">${l.title}</strong><br/>
      <span style="color:#64748b;font-size:13px">${l.year} · ${l.mileage?.toLocaleString('ro-RO')} km · <strong style="color:#1d4ed8">${l.price?.toLocaleString('ro-RO')} ${l.currency}</strong></span>
    </a>`).join('');
  try {
    await transporter.sendMail({
      from: `"AutoMarket" <${EMAIL_USER}>`,
      to: toEmail,
      subject: `${listings.length} anunț${listings.length > 1 ? 'uri noi' : ' nou'} pentru „${searchName}"`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
          <h2 style="color:#1d4ed8">Alertă de căutare — AutoMarket</h2>
          <p>Salut <strong>${toName}</strong>, am găsit ${listings.length} anunț${listings.length > 1 ? 'uri noi' : ' nou'} pentru alerta ta <em>„${searchName}"</em>:</p>
          <div style="margin:16px 0">${listingsHtml}</div>
          <a href="${CLIENT_URL}/listings" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
            Vezi toate anunțurile
          </a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">AutoMarket — piața auto din România</p>
        </div>`,
    });
  } catch (err) {
    console.error('[email] Alert failed:', err.message);
  }
};

export const sendNewMessageEmail = async ({ toEmail, toName, fromName, listingTitle, previewText, conversationId }) => {
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from: `"AutoMarket" <${EMAIL_USER}>`,
      to: toEmail,
      subject: `Mesaj nou de la ${fromName} — ${listingTitle}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
          <h2 style="color:#1d4ed8">Ai un mesaj nou pe AutoMarket</h2>
          <p>Salut <strong>${toName}</strong>,</p>
          <p><strong>${fromName}</strong> ți-a trimis un mesaj în legătură cu anunțul <em>${listingTitle}</em>:</p>
          <blockquote style="background:#f1f5f9;padding:12px 16px;border-left:4px solid #3b82f6;border-radius:4px;margin:16px 0">
            ${previewText}
          </blockquote>
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/messages/${conversationId}"
             style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
            Răspunde mesajului
          </a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">AutoMarket — piața auto din România</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[email] Failed to send:', err.message);
  }
};
