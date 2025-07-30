# Grok 4 Prompt: Generate a Creative Shopify Intro Guide Website

You are a creative front-end designer.

Build a modern, animated HTML website with a full-screen layout and elegant **glassmorphism-style step-by-step guide**.

The content is a tutorial for Shopify store owners to add a **video intro screen** that plays before the storefront loads.

## 🎨 Layout & Design Requirements

* Use **glassmorphism-style step cards** with blurred background and soft glow
* Full-width, centered container with generous padding and modern typography (e.g., Inter or Segoe UI)
* Navigation through steps via **“Start Guide”**, “Next Step”, and “Previous” buttons
* Smooth transitions between steps (fade, slide, etc.)
* Highlight icons like 🎬, 🛠, 📁, ⚙️, and 📸 in headers for clarity
* Optional background animation or particles

## 🔧 Functional Behavior

* Show only one step at a time
* Clicking “Start Guide” reveals Step 1; users can navigate step-by-step
* Optional: Add a step counter and visual progress bar
* Include **Copy to Clipboard** buttons for code blocks

---

## 📝 Step-by-Step Guide Content

### 🎬 Introduction

Make your store’s first impression **memorable and immersive** with a custom **video intro screen**. This guide walks you through adding a branding-focused animation that plays before your store loads.

---

### 🛠 Prerequisites

* Shopify Admin access
* A short **MP4 video** (desktop & mobile)
* (Optional) **MP3 audio**
* Skip button text (optional)

---

### 📁 Step 1: Open Shopify Code Editor

1. Visit `https://admin.shopify.com/store/your-store-handle`
2. Go to **Online Store > Themes**
3. Click the **3-dot menu** > **Edit code**

📸 Insert image showing how to access the code editor

---

### 📂 Step 2: Add Snippet – `video-intro.liquid`

1. Scroll to **Snippets**
2. Click **Add new snippet**
3. Name it `video-intro`
4. Paste the code below:

```liquid
{% raw %}
<!-- Shopify video intro code -->
{% endraw %}
```

📸 Insert image showing where and how to paste the snippet

---

### ⚙️ Step 3: Update `settings_schema.json`

Paste the following block *after the `theme_support_url`*:

```json
{
  "name": "Video intro",
  "settings": [
    { "type": "url", "id": "intro_audio_file", "label": "Background Audio" },
    { "type": "url", "id": "intro_desktop_video", "label": "Desktop Video" },
    { "type": "url", "id": "intro_mobile_video", "label": "Mobile Video" },
    { "type": "range", "id": "volume_intro", "min": 0, "max": 100, "step": 1, "unit": "%", "label": "Audio Volume", "default": 20 },
    { "type": "header", "content": "Video Intro Settings" },
    { "type": "text", "id": "intro_skip", "label": "Skip Button Text", "default": "Skip Intro" },
    { "type": "color", "id": "skip_color", "label": "Skip Button Color", "default": "#ffffff" }
  ]
}
```

📸 Show image with highlighted placement in `settings_schema.json`

---

### 🧩 Step 4: Embed Snippet in `theme.liquid`

Find this line:

```liquid
<link rel="canonical" href="{{ canonical_url }}">
```

Paste this line **below it**:

```liquid
{% render 'video-intro' %}
```

📸 Insert before-and-after image of the `theme.liquid` file

---

### 🎨 Step 5: Customize Settings

Available in Theme Editor:

| Setting           | Description              |
| ----------------- | ------------------------ |
| Background Audio  | Upload .mp3              |
| Desktop Video     | Upload .mp4 for desktop  |
| Mobile Video      | Upload .mp4 for mobile   |
| Audio Volume      | Adjust from 0–100%       |
| Skip Button Text  | Customize or hide        |
| Skip Button Color | Change text/border color |

📸 Image of the theme settings in Theme Editor

---

### 🔍 Step 6: Preview and Test

1. Go to your Shopify store’s front page
2. You should now see a full-screen branded video intro
3. Skip button will appear (if enabled)
4. Audio plays (if configured)

🎉 Congrats! You now have an immersive Shopify intro experience

---

### 🤝 Support

Need help or want a custom version? Reach out anytime.
Created with ❤️ by \[Your Company Name]
Powered by immersive web experiences
