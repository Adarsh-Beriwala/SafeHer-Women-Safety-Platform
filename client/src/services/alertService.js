import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const sendSOSAlert = async (contacts, userData, locationData, trackingLink) => {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const mapsLink = locationData
    ? `https://www.google.com/maps?q=${locationData.lat},${locationData.lng}`
    : 'Location unavailable';

  const results = [];

  for (const contact of contacts) {
    try {
      // If the emergency contact doesn't have an email, we can't send an email to them!
      const recipientEmail = contact.email || userData.email || 'adarshberiwala05@gmail.com'; // fallback

      const templateParams = {
        to_name: contact.name || 'Emergency Contact',
        to_email: recipientEmail,
        email: recipientEmail, // Added to match {{email}}
        from_name: userData.name || 'User',
        user_name: userData.name || 'User',
        user_phone: userData.phone || 'N/A',
        message: `🚨 EMERGENCY SOS ALERT 🚨\n\n${userData.name || 'User'} has triggered an emergency SOS alert!\n\nTime: ${timestamp}\n\nLive Location: ${mapsLink}\n\nLive Tracking Link: ${trackingLink || 'N/A'}\n\nPlease respond immediately and contact local authorities if needed.\n\nEmergency Numbers:\n- Police: 100\n- Women Helpline: 1091\n- Ambulance: 108`,
        timestamp: timestamp,
        tracking_link: trackingLink || '#',
        maps_link: mapsLink,
      };

      // Simulate email if keys are not configured
      if (!SERVICE_ID || SERVICE_ID === 'your_service_id') {
        console.log(`[SIMULATED EMAIL] To: ${recipientEmail} | Subject: EMERGENCY SOS ALERT`);
        await new Promise(resolve => setTimeout(resolve, 500));
        results.push({ contact: contact.name, status: 'sent' });
      } else {
        if (!recipientEmail) throw new Error("No email address found for this contact.");
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        results.push({ contact: contact.name || 'Contact', status: 'sent' });
      }
    } catch (error) {
      console.error(`Failed to send alert to ${contact.name}:`, error);
      results.push({ contact: contact.name || 'Contact', status: 'failed', error });
    }
  }

  return results;
};

export const sendVolunteerAlert = async (volunteerEmail, volunteerName, victimData, trackingLink) => {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  try {
    const templateParams = {
      to_name: volunteerName,
      to_email: volunteerEmail,
      email: volunteerEmail, // Required if the template uses {{email}}
      from_name: 'SafeHer Emergency System',
      user_name: victimData.name,
      message: `🆘 VOLUNTEER ALERT 🆘\n\nA nearby user "${victimData.name}" has triggered an emergency SOS!\n\nTime: ${timestamp}\n\nLive Tracking: ${trackingLink}\n\nPlease proceed to help if you can do so safely.`,
      timestamp: timestamp,
      tracking_link: trackingLink || '#',
      maps_link: trackingLink || '#',
    };

    // Simulate email if keys are not configured
    if (!SERVICE_ID || SERVICE_ID === 'your_service_id') {
      console.log(`[SIMULATED VOLUNTEER EMAIL] To: ${volunteerEmail}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { status: 'sent' };
    } else {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      return { status: 'sent' };
    }
  } catch (error) {
    console.error('Failed to send volunteer alert:', error);
    return { status: 'failed', error };
  }
};
