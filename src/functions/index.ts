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
          // IMPORTANT: Replace "booking@your-verified-domain.com" with an
          // address from the domain you verified in your Resend account.
          const {data, error} = await resend.emails.send({
            from: "Hotel Maxim <rezervari@hotel-maxim.ro>",
            to: [guestEmail],
            subject: "Your Booking at Hotel Maxim is Confirmed!",
            html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: sans-serif; line-height: 1.6;">
            <h2>Booking Confirmed!</h2>
            <p>Hello ${guestName},</p>
            <p>We're delighted to confirm your reservation at Hotel Maxim.</p>
            <h3>Reservation Details:</h3>
            <ul>
              <li><strong>Room Type:</strong> ${afterData.roomType}</li>
              <li>
                <strong>Check-in:</strong>
                ${afterData.checkIn.toDate().toLocaleDateString("ro-RO")}
              </li>
              <li>
                <strong>Check-out:</strong>
                ${afterData.checkOut.toDate().toLocaleDateString("ro-RO")}
              </li>
              <li><strong>Guests:</strong> ${afterData.guests}</li>
              <li>
                <strong>Total Price:</strong>
                ${afterData.totalPrice.toFixed(2)} RON
              </li>
            </ul>
            <p>Payment will be processed at the property upon arrival.</p>
            <p>We look forward to welcoming you!</p>
            <br/>
            <p>Best regards,</p>
            <p>The Team at Hotel Maxim</p>
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

          // BONUS: This automatically updates the status to "Email Sent".
          return event.data.after.ref.update({status: "Email Sent"});
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
