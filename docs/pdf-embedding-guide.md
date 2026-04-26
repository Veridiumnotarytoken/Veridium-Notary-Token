# PDF Embedding Guide

To attach a VNT to a PDF:

1. Issue the token and save it as JSON.
2. Generate a QR code encoding the full JSON string (or a URL that resolves to the token).
3. Insert the QR code on the PDF document (e.g., using Adobe Acrobat or a PDF library).
4. Optionally print the token ID (e.g., `https://veridium.io/vnt/abc123`) in human-readable text.

Verifiers can scan the QR code, extract the token, and run the verification CLI or web tool.

**Generating QR code (CLI):**
```bash
npm install -g qrcode
qrcode "`cat token.json`" > qr.png
```
