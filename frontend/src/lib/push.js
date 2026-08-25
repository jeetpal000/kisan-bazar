import webpush from "web-push";
import { PushSubscriptionTable } from "@/model/auth.Schema";
import { CreateServer } from "@/utils/db";

const isConfigured = Boolean(
  process.env.VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY &&
  process.env.VAPID_SUBJECT,
);

if (isConfigured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
}

export const sendChatPush = async ({ userId, senderName, text, chatUserId }) => {
  if (!isConfigured) return;
  await CreateServer();
  const subscriptions = await PushSubscriptionTable.find({ userId }).lean();
  const payload = JSON.stringify({
    title: senderName || "New message",
    body: text,
    tag: `chat-${chatUserId}`,
    url: `/chat/${chatUserId}`,
  });
  await Promise.all(subscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification(subscription, payload);
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        await PushSubscriptionTable.deleteOne({ endpoint: subscription.endpoint });
      }
    }
  }));
};