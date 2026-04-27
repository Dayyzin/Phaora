# Stripe Setup for PHAORA Sculptures

## 1. Create Products in Stripe

For each sculpture you want to sell:

1. Go to [Stripe Dashboard > Products](https://dashboard.stripe.com/products)
2. Click **Add product**
3. Fill in:
   - **Name**: The piece name (e.g. "The Beacon")
   - **Description**: Optional
   - **Image**: Upload the hero photo
4. Under **Pricing**, click **Add a price**:
   - **Price**: The USD amount (e.g. 4500.00)
   - **One time** (not recurring)
   - **Currency**: USD
5. Click **Save product**

## 2. Copy the Price ID into catalog.json

After creating each product:

1. Open the product in Stripe Dashboard
2. Scroll to the **Pricing** section
3. You will see an ID starting with `price_` (e.g. `price_1NxYz...`)
4. Copy this ID
5. Open `/assets/sculptures/catalog.json`
6. Find the matching piece by slug and set its `stripe_price_id`:

```json
{
  "slug": "beacon",
  "stripe_price_id": "price_1NxYzABCDEFG",
  "price_usd": 4500,
  ...
}
```

Also set `price_usd` to match the price you entered in Stripe (used for display).

## 3. Add Your Publishable Key

1. Go to [Stripe Dashboard > Developers > API Keys](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** (starts with `pk_live_`)
3. Open `/sculpture/config.js`
4. Replace `pk_live_REPLACE_ME` with your actual key:

```js
window.PHAORA_CONFIG = {
  stripePublicKey: 'pk_live_YOUR_ACTUAL_KEY_HERE'
};
```

Note: The publishable key is safe to include in client-side code. Never expose your secret key.

## 4. Order Notifications

Since phaora.com is a static site, Stripe webhooks need an external handler. The simplest options:

**Option A: Stripe Email Receipts (built-in)**
1. Go to Stripe Dashboard > Settings > Emails
2. Enable **Successful payments** receipts
3. This emails the customer automatically

**Option B: Zapier / Make.com (recommended for seller notification)**
1. Create a free account on [Zapier](https://zapier.com) or [Make.com](https://make.com)
2. Create a new Zap/Scenario:
   - **Trigger**: Stripe > New Payment
   - **Action**: Email > Send Email
   - **To**: david@phaora.com
   - **Subject**: "New sculpture order: {product name}"
   - **Body**: Include customer email, amount, product name
3. This sends you an email every time someone completes checkout

## 5. Florida Sales Tax

If collecting sales tax:

1. Register with [Florida Department of Revenue](https://floridarevenue.com) for a sales tax certificate
2. In Stripe Dashboard, go to **Tax** section
3. Click **Add a tax rate**
4. Set: Florida, 6% (or your county rate — Broward is 7%, Palm Beach is 7%)
5. Apply the tax rate to your products or use Stripe Tax for automatic calculation

## Quick Checklist

- [ ] Create Stripe product for each piece with a price
- [ ] Copy each `price_` ID into catalog.json `stripe_price_id` field
- [ ] Set `price_usd` to match for each piece in catalog.json
- [ ] Copy publishable key into `/sculpture/config.js`
- [ ] Set up order notification via Zapier/Make
- [ ] Configure Florida sales tax rate
- [ ] Test with Stripe test mode first (`pk_test_` key), then switch to live
