
import {onUpdate} from "firebase-functions/v2/firestore";
import {defineString} from "firebase-functions/v2/params";
import * as logger from "firebase-functions/logger";
import {initializeApp} from "firebase-admin/app";
import {Resend} from "resend";

// This initializes the Firebase Admin SDK for your function.
initializeApp();

// This securely accesses the Resend API key you set earlier.
const RESEND_API_KEY = defineString("RESEND_API_KEY");

export const onBookingStatusChange = onUpdate(
    "bookings/{bookingId}",
    async (event) => {
      // This function triggers whenever a document in the "bookings" collection
      // is updated.
      if (!event.data) {
        logger.info("No data associated with the event, skipping.");
        return;
      }

      const beforeData = event.data.before.data();
      const afterData = event.data.after.data();

      // We only proceed if the status changed FROM something else TO "Confirmed"
      if (beforeData.status !== "Confirmed" &&
        afterData.status === "Confirmed") {
        const guestEmail = afterData.email;
        const guestName = afterData.fullName;

        if (!guestEmail) {
          logger.warn(
              `Booking ${event.params.bookingId} has no email, ` +
              "cannot send confirmation."
          );
          return;
        }

        logger.info(
            `Status for booking ${event.params.bookingId} changed to ` +
            `Confirmed. Sending email to ${guestEmail}...`
        );

        const resend = new Resend(RESEND_API_KEY.value());

        try {
          // Fix for date shift: Force formatting using the hotel's timezone (Europe/Bucharest)
          const dateOptions: Intl.DateTimeFormatOptions = {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "Europe/Bucharest",
          };

          const checkInDate = afterData.checkIn.toDate().toLocaleDateString("ro-RO", dateOptions);
          const checkOutDate = afterData.checkOut.toDate().toLocaleDateString("ro-RO", dateOptions);

          const {data, error} = await resend.emails.send({
            from: "Hotel Maxim <rezervari@hotel-maxim.ro>",
            to: [guestEmail],
            subject: "Your Booking at Hotel Maxim is Confirmed!",
            html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
              <h2 style="color: #191970; text-align: center;">Booking Confirmed!</h2>
              <p>Hello <strong>${guestName}</strong>,</p>
              <p>We're delighted to confirm your reservation at <strong>Hotel Maxim</strong>.</p>
              
              <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Reservation Details:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 5px 0;"><strong>Room Type:</strong></td><td>${afterData.roomType}</td></tr>
                  <tr><td style="padding: 5px 0;"><strong>Check-in:</strong></td><td>${checkInDate}</td></tr>
                  <tr><td style="padding: 5px 0;"><strong>Check-out:</strong></td><td>${checkOutDate}</td></tr>
                  <tr><td style="padding: 5px 0;"><strong>Guests:</strong></td><td>${afterData.guests}</td></tr>
                  <tr><td style="padding: 5px 0;"><strong>Total Price:</strong></td><td style="font-weight: bold; color: #191970;">${afterData.totalPrice.toFixed(2)} RON</td></tr>
                </table>
              </div>

              <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border: 1px solid #ffeeba; margin-top: 20px;">
                <p style="margin: 0 0 10px 0;"><strong>Payment will be processed at the property upon arrival.</strong></p>
                <p style="margin: 0; font-size: 0.9em; color: #856404;">* Please note: Prices shown do not include the 3% local tax. This will be calculated and paid separately at the reception during check-in.</p>
              </div>

              <p style="margin-top: 25px;">We look forward to welcoming you!</p>
              <br/>
              <p>Best regards,<br/>The Team at Hotel Maxim</p>
            </div>
          </body>
          </html>
        `,
          });

          if (error) {
            logger.error(
                `Error sending email for booking ${event.params.bookingId}:`,
                error
            );
            return;
          }

          logger.info(
              `Confirmation email sent successfully. Email ID: ${data?.id}`
          );

          return event.data.after.ref.update({
            status: "Email Sent",
            emailSentAt: new Date()
          });
        } catch (e) {
          logger.error(
              "A failure occurred while trying to send email for booking " +
              `${event.params.bookingId}:`,
              e
          );
        }
      }
      return null;
    });
