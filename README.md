# Trade Social Independent Site

This is a static export product website. Open it through a local server so the product JSON can load correctly.

## Product data

Edit product information in:

```text
data/products.json
```

Each product supports:

- `name`: English product name
- `category`: product category for filtering
- `tagline`: one-line sales description
- `image`: image path under `assets/`
- `moq`, `leadTime`, `priceRange`: trade details
- `certifications`, `markets`: searchable tags
- `specs`: key-value product specifications
- `applications`: buyer use cases
- `socialCopy`: social media selling copy
- `detail`: detail page paragraph

## Inquiry email

Change the email address in:

```text
script.js
```

Find:

```js
const inquiryEmail = "sales@example.com";
```

Replace it with your company email.
