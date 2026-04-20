/**
 * Database seeder
 * Populates the database with sample data for development.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from './connection';

// ─── Campaign templates ────────────────────────────────────────────
const campaignTemplates = [
    // Draft campaigns (10)
    {
        name: 'Spring Newsletter',
        subject: 'Check out our spring deals! 🌸',
        body: '<h1>Spring is here!</h1><p>Take advantage of our amazing spring deals with up to 40% off on all products.</p>',
        status: 'draft',
    },
    {
        name: 'Product Survey',
        subject: 'We value your feedback 📝',
        body: '<h1>Help Us Improve</h1><p>Take our quick 2-minute survey and get a 10% discount on your next purchase.</p>',
        status: 'draft',
    },
    {
        name: 'VIP Early Access',
        subject: 'Exclusive early access for VIPs 👑',
        body: '<h1>VIP Only</h1><p>As a valued VIP member, you get 48-hour early access to our newest collection.</p>',
        status: 'draft',
    },
    {
        name: 'Referral Program Launch',
        subject: 'Refer a friend, earn rewards! 🎁',
        body: '<h1>Spread the Word</h1><p>For every friend you refer, both of you get $20 off your next order.</p>',
        status: 'draft',
    },
    {
        name: 'App Download Reminder',
        subject: 'Download our app for exclusive deals 📱',
        body: "<h1>Go Mobile</h1><p>Our new app has exclusive deals you won't find anywhere else. Download now!</p>",
        status: 'draft',
    },
    {
        name: 'Loyalty Points Update',
        subject: 'Your loyalty points are waiting! ⭐',
        body: "<h1>Points Balance</h1><p>You have accumulated points waiting to be redeemed. Don't let them expire!</p>",
        status: 'draft',
    },
    {
        name: 'Webinar Invitation',
        subject: 'Join our free webinar this Thursday 🎓',
        body: '<h1>Learn With Us</h1><p>Join industry experts for a free webinar on the latest trends and best practices.</p>',
        status: 'draft',
    },
    {
        name: 'Sustainability Report',
        subject: 'Our commitment to the planet 🌍',
        body: "<h1>Going Green</h1><p>Read about our latest sustainability initiatives and how we're reducing our carbon footprint.</p>",
        status: 'draft',
    },
    {
        name: 'Customer Appreciation',
        subject: 'Thank you for being awesome! 💙',
        body: "<h1>You're Amazing</h1><p>As a token of our appreciation, here's a special gift just for you.</p>",
        status: 'draft',
    },
    {
        name: 'Beta Feature Preview',
        subject: 'Sneak peek: New features coming soon 🔮',
        body: "<h1>Coming Soon</h1><p>Get a first look at the exciting new features we're building just for you.</p>",
        status: 'draft',
    },

    // Scheduled campaigns (8)
    {
        name: 'Summer Product Launch',
        subject: 'Introducing our new summer collection ☀️',
        body: '<h1>New Collection Alert!</h1><p>We are excited to announce our brand new summer collection. Be the first to shop!</p>',
        status: 'scheduled',
        daysFromNow: 3,
    },
    {
        name: 'Back to School Sale',
        subject: 'Back to school essentials at 30% off 📚',
        body: '<h1>School Season</h1><p>Stock up on everything you need for the new school year at unbeatable prices.</p>',
        status: 'scheduled',
        daysFromNow: 7,
    },
    {
        name: 'Flash Sale Alert',
        subject: '⚡ 24-hour flash sale starts tomorrow!',
        body: "<h1>Flash Sale</h1><p>Don't miss our biggest flash sale of the year. Up to 60% off on selected items!</p>",
        status: 'scheduled',
        daysFromNow: 1,
    },
    {
        name: 'Holiday Gift Guide',
        subject: 'Your ultimate holiday gift guide 🎄',
        body: '<h1>Gift Ideas</h1><p>Find the perfect gift for everyone on your list with our curated holiday guide.</p>',
        status: 'scheduled',
        daysFromNow: 14,
    },
    {
        name: 'New Year Kickoff',
        subject: 'Start the new year right! 🎆',
        body: '<h1>New Year, New You</h1><p>Kickstart the new year with our special offers on health and wellness products.</p>',
        status: 'scheduled',
        daysFromNow: 21,
    },
    {
        name: 'Anniversary Sale',
        subject: 'Celebrate our 5th anniversary with us! 🎂',
        body: '<h1>5 Years Strong</h1><p>Join us in celebrating 5 amazing years with exclusive anniversary deals.</p>',
        status: 'scheduled',
        daysFromNow: 5,
    },
    {
        name: 'Weekend Deals Preview',
        subject: "This weekend's hottest deals 🔥",
        body: '<h1>Weekend Special</h1><p>Preview the incredible deals waiting for you this weekend. Save big!</p>',
        status: 'scheduled',
        daysFromNow: 2,
    },
    {
        name: 'Member Exclusive Event',
        subject: "You're invited to our members-only event 🎟️",
        body: '<h1>Exclusive Event</h1><p>Join us for a special shopping event with extra discounts for members only.</p>',
        status: 'scheduled',
        daysFromNow: 10,
    },

    // Sent campaigns (10)
    {
        name: 'Welcome Email',
        subject: 'Welcome to our platform! 🎉',
        body: '<h1>Welcome!</h1><p>Thank you for joining us. Here is everything you need to get started.</p>',
        status: 'sent',
        daysAgo: 3,
    },
    {
        name: 'Black Friday Deals',
        subject: 'Black Friday: Up to 70% off! 🖤',
        body: '<h1>Black Friday</h1><p>Our biggest sale of the year is here! Shop now before everything sells out.</p>',
        status: 'sent',
        daysAgo: 30,
    },
    {
        name: "Valentine's Day Special",
        subject: 'Love is in the air ❤️',
        body: "<h1>Valentine's Day</h1><p>Surprise your loved ones with our specially curated Valentine's collection.</p>",
        status: 'sent',
        daysAgo: 60,
    },
    {
        name: 'Monthly Newsletter - March',
        subject: 'March highlights and updates 📰',
        body: "<h1>March Roundup</h1><p>Here's what happened this month — new arrivals, top picks, and community stories.</p>",
        status: 'sent',
        daysAgo: 45,
    },
    {
        name: 'Security Update Notice',
        subject: 'Important: Security update for your account 🔒',
        body: "<h1>Security Update</h1><p>We've enhanced our security measures to better protect your account.</p>",
        status: 'sent',
        daysAgo: 15,
    },
    {
        name: 'End of Season Clearance',
        subject: 'Final clearance: Everything must go! 🏷️',
        body: "<h1>Clearance Sale</h1><p>Last chance to grab incredible deals on winter items before they're gone forever.</p>",
        status: 'sent',
        daysAgo: 20,
    },
    {
        name: 'Customer Feedback Results',
        subject: 'You spoke, we listened! 🗣️',
        body: '<h1>Your Feedback Matters</h1><p>See how your feedback has shaped our latest product improvements.</p>',
        status: 'sent',
        daysAgo: 10,
    },
    {
        name: 'Re-engagement Campaign',
        subject: 'We miss you! Come back for 25% off 👋',
        body: "<h1>We Miss You</h1><p>It's been a while! Here's a special 25% discount to welcome you back.</p>",
        status: 'sent',
        daysAgo: 7,
    },
    {
        name: 'Product Launch Recap',
        subject: 'In case you missed it: New product launch 🚀',
        body: "<h1>Launch Recap</h1><p>Missed our big launch event? Here's everything you need to know about our latest product.</p>",
        status: 'sent',
        daysAgo: 5,
    },
    {
        name: 'Monthly Newsletter - April',
        subject: "April highlights and what's next 🌷",
        body: "<h1>April Roundup</h1><p>Spring vibes, new releases, and exclusive previews — all in this month's newsletter.</p>",
        status: 'sent',
        daysAgo: 2,
    },
] as const;

// ─── Recipient templates ───────────────────────────────────────────
const firstNames = [
    'James',
    'Mary',
    'Robert',
    'Patricia',
    'John',
    'Jennifer',
    'Michael',
    'Linda',
    'William',
    'Elizabeth',
];
const lastNames = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Garcia',
    'Miller',
    'Davis',
    'Rodriguez',
    'Martinez',
];

const recipientData = Array.from({ length: 50 }, (_, i) => {
    const f = firstNames[i % firstNames.length];
    const l = lastNames[Math.floor(i / 10) % lastNames.length];
    return {
        email: `${f.toLowerCase()}.${l.toLowerCase()}.${i + 1}@example.com`,
        name: `${f} ${l}`,
    };
});

// ─── Helpers ───────────────────────────────────────────────────────

/** Pick N random recipients from the list */
function pickRandom<T>(arr: T[], min: number, max: number): T[] {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, arr.length));
}

/** Create campaign_recipients rows for a "sent" campaign with simulated delivery stats */
function buildSentRecipientRows(
    campaignId: string,
    recipients: { id: string }[],
    sentDaysAgo: number,
) {
    const sentAt = new Date(Date.now() - sentDaysAgo * 24 * 60 * 60 * 1000);

    return recipients.map((r) => {
        // ~90% delivered, ~10% failed
        const delivered = Math.random() < 0.9;
        const wasOpened = delivered && Math.random() < 0.6;

        return {
            campaign_id: campaignId,
            recipient_id: r.id,
            status: delivered ? 'sent' : 'failed',
            sent_at: delivered ? sentAt : null,
            opened_at: wasOpened
                ? new Date(sentAt.getTime() + Math.floor(Math.random() * 120) * 60 * 1000)
                : null,
        };
    });
}

// ─── Main seed function ────────────────────────────────────────────

async function seed() {
    try {
        await db.raw('SELECT 1+1 AS result');
        console.log('Database connected');

        // Clean existing data (reverse order for FK constraints)
        await db('job_queue').del();
        await db('campaign_recipients').del();
        await db('campaigns').del();
        await db('recipients').del();
        await db('users').del();
        console.log('Cleared existing data');

        // ─── Users ─────────────────────────────────────────────────
        const passwordHash = await bcrypt.hash('password123', 12);
        const [user] = await db('users')
            .insert({
                email: 'admin@example.com',
                name: 'Admin User',
                password_hash: passwordHash,
            })
            .returning('*');
        console.log(`Created user: ${user.email}`);

        // ─── Recipients ────────────────────────────────────────────
        const recipients = await db('recipients').insert(recipientData).returning('*');
        console.log(`Created ${recipients.length} recipients`);

        // ─── Campaigns ─────────────────────────────────────────────
        let draftCount = 0;
        let scheduledCount = 0;
        let sentCount = 0;
        let sendingCount = 0;

        const allCampaignRecipientRows: Record<string, unknown>[] = [];

        for (const template of campaignTemplates) {
            const campaignData: Record<string, unknown> = {
                name: template.name,
                subject: template.subject,
                body: template.body,
                status: template.status,
                created_by: user.id,
                // Stagger created_at for realistic ordering
                created_at: new Date(
                    Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000,
                ),
            };

            if ('daysFromNow' in template && template.daysFromNow) {
                campaignData.scheduled_at = new Date(
                    Date.now() + template.daysFromNow * 24 * 60 * 60 * 1000,
                );
            }

            const [campaign] = await db('campaigns').insert(campaignData).returning('*');
            const selected = pickRandom(recipients, 15, 45);

            switch (template.status) {
                case 'draft': {
                    // Draft: just link recipients, no delivery data
                    for (const r of selected) {
                        allCampaignRecipientRows.push({
                            campaign_id: campaign.id,
                            recipient_id: r.id,
                        });
                    }
                    draftCount++;
                    break;
                }
                case 'scheduled': {
                    // Scheduled: link recipients, no delivery data
                    for (const r of selected) {
                        allCampaignRecipientRows.push({
                            campaign_id: campaign.id,
                            recipient_id: r.id,
                        });
                    }
                    scheduledCount++;
                    break;
                }
                case 'sent': {
                    const daysAgo = 'daysAgo' in template ? template.daysAgo : 3;
                    const rows = buildSentRecipientRows(campaign.id, selected, daysAgo);
                    allCampaignRecipientRows.push(...rows);
                    sentCount++;
                    break;
                }
            }
        }

        // Batch insert all campaign_recipients at once
        if (allCampaignRecipientRows.length > 0) {
            await db('campaign_recipients').insert(allCampaignRecipientRows);
        }

        console.log(
            `Created ${campaignTemplates.length} campaigns: ` +
                `${draftCount} draft, ${scheduledCount} scheduled, ${sendingCount} sending, ${sentCount} sent`,
        );
        console.log(`Linked ${allCampaignRecipientRows.length} campaign-recipient records`);
        console.log('\n🎉 Seed completed! Login with:');
        console.log('   Email: admin@example.com');
        console.log('   Password: password123\n');
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    } finally {
        await db.destroy();
    }
}

seed();
