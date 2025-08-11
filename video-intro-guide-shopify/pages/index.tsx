import Head from 'next/head'

const css = `body {\n            margin: 0;\n            padding: 0;\n            background-image: url('/abstract-luxury-gradient-blue-background-smooth-dark-blue-with-black-vignette-studio-banner.jpg');\n            background-size: cover;\n            background-position: center;\n            height: 100vh;\n            display: flex;\n            flex-direction: column;\n            justify-content: flex-start;\n            align-items: center;\n            font-family: 'Inter', sans-serif;\n            color: white;\n            overflow: auto;\n        }\n        .header {\n            margin-top: 20vh;\n            background: rgba(255, 255, 255, 0.1);\n            backdrop-filter: blur(10px);\n            border: 1px solid rgba(255, 255, 255, 0.2);\n            border-radius: 15px;\n            padding: 20px;\n            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\n            position: relative;\n            overflow: hidden;\n            transition: transform 0.5s ease, margin-top 0.5s ease, background 0.5s ease, backdrop-filter 0.5s ease, border 0.5s ease, box-shadow 0.5s ease;\n            display: flex;\n            flex-direction: column;\n            align-items: center;\n            cursor: pointer;\n        }\n        .header:hover {\n            transform: scale(1.05);\n        }\n        .header.clicked {\n            margin-top: 20px;\n            transform: none;\n            background: rgba(255, 255, 255, 0);\n            backdrop-filter: blur(0px);\n            border: 1px solid rgba(255, 255, 255, 0);\n            box-shadow: none;\n        }\n        .header::before {\n            content: '';\n            position: absolute;\n            top: -50%;\n            left: -100%;\n            width: 200%;\n            height: 200%;\n            background: linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.05) 30%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.05) 70%, transparent 100%);\n            transform: rotate(45deg);\n            transition: left 0.7s ease, opacity 0.5s ease;\n            filter: blur(5px);\n        }\n        .header:hover::before {\n            left: 100%;\n        }\n        .header.clicked::before {\n            opacity: 0;\n        }\n        .logo {\n            width: 200px;\n            height: auto;\n        }\n        .title {\n            font-family: 'Inter', sans-serif;\n            color: white;\n            font-size: 24px;\n            font-weight: 700;\n            margin-top: 10px;\n        }\n        .guide {\n            display: none;\n            width: 100%;\n            max-width: 800px;\n            margin: 20px auto;\n        }\n        .guide.active {\n            display: block;\n            animation: fadeIn 0.5s ease;\n        }\n        .container {\n            text-align: center;\n            padding: 20px;\n        }\n        .start-button {\n            background: rgba(255, 255, 255, 0.1);\n            backdrop-filter: blur(10px);\n            border: 1px solid rgba(255, 255, 255, 0.2);\n            border-radius: 10px;\n            padding: 15px 30px;\n            font-size: 24px;\n            font-weight: 700;\n            color: white;\n            cursor: pointer;\n            transition: transform 0.3s ease;\n        }\n        .start-button:hover {\n            transform: scale(1.05);\n        }\n        .step {\n            display: none;\n            background: rgba(255, 255, 255, 0.1);\n            backdrop-filter: blur(10px);\n            border: 1px solid rgba(255, 255, 255, 0.2);\n            border-radius: 15px;\n            padding: 30px;\n            max-width: 800px;\n            text-align: left;\n            animation: fadeIn 0.5s ease;\n        }\n        .step.active {\n            display: block;\n        }\n        @keyframes fadeIn {\n            from { opacity: 0; transform: translateY(20px); }\n            to { opacity: 1; transform: translateY(0); }\n        }\n        h2 {\n            font-size: 28px;\n            margin-bottom: 20px;\n        }\n        p, li {\n            font-size: 18px;\n            line-height: 1.6;\n        }\n        .code-block {\n            background: rgba(0, 0, 0, 0.3);\n            padding: 15px;\n            border-radius: 8px;\n            position: relative;\n            overflow-x: auto;\n            text-align: center;\n        }\n        .code-block pre {\n            display: none;\n        }\n        .copy-btn {\n            background: rgba(255, 255, 255, 0.2);\n            border: none;\n            padding: 10px 20px;\n            cursor: pointer;\n            color: white;\n            border-radius: 5px;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            gap: 10px;\n            font-size: 16px;\n        }\n        .copy-btn img {\n            width: 30px;\n            height: auto;\n        }\n        .nav-buttons {\n            display: flex;\n            justify-content: space-between;\n            margin-top: 20px;\n        }\n        .nav-btn {\n            background: rgba(255, 255, 255, 0.1);\n            border: 1px solid rgba(255, 255, 255, 0.2);\n            padding: 10px 20px;\n            border-radius: 5px;\n            cursor: pointer;\n            color: white;\n        }\n        .progress-bar {\n            height: 5px;\n            background: rgba(255, 255, 255, 0.3);\n            margin-bottom: 20px;\n            border-radius: 5px;\n            overflow: hidden;\n        }\n        .progress {\n            height: 100%;\n            background: white;\n            transition: width 0.3s ease;\n        }\n        .step img[src*='Images/'] {\n            transition: width 0.3s ease, transform 0.3s ease;\n        }\n        .step img[src*='Images/']:hover {\n            width: 100% !important;\n            transform: scale(1.2);\n            z-index: 10;\n        }\n        .step img[src='Images/Customize Settings.png']:hover {\n            width: 20% !important;\n            transform: scale(1.1);\n        }\n        .settings-table {\n            width: 100%;\n            border-collapse: collapse;\n            margin: 20px 0;\n        }\n        .settings-table th, .settings-table td {\n            padding: 12px 15px;\n            border: 1px solid rgba(255, 255, 255, 0.3);\n            text-align: left;\n            font-size: 18px;\n        }\n        .settings-table th {\n            background: rgba(255, 255, 255, 0.2);\n            font-weight: 700;\n        }\n        .step img[src='/Images/Customize Settings.png']{ width:10%; display:block; margin:10px auto; border-radius:8px; }`;

const markup = `
<div class="header" onclick="startGuide()">
  <img src="/Shopify_logo_2018.svg" alt="Shopify Logo" class="logo" />
  <p class="title">VIDEO-INTRO-GUIDE</p>
</div>
<div class="guide" id="guide">
  <div id="step0" class="step active">
    <h2>🎬 Introduction</h2>
    <p>Make your store’s first impression <strong>memorable and immersive</strong> with a custom <strong>video intro screen</strong>. This guide walks you through adding a branding-focused animation that plays before your store loads.</p>
    <div class="nav-buttons"><button class="nav-btn" onclick="nextStep(1)">Next Step</button></div>
  </div>
  <div id="step1" class="step">
    <h2>🛠 Prerequisites</h2>
    <ul>
      <li>Shopify Admin access</li>
      <li>A short <strong>MP4 video</strong> (desktop & mobile)</li>
      <li>(Optional) <strong>MP3 audio</strong></li>
      <li>Skip button text (optional)</li>
    </ul>
    <div class="nav-buttons"><button class="nav-btn" onclick="prevStep(0)">Previous</button><button class="nav-btn" onclick="nextStep(2)">Next Step</button></div>
  </div>
  <div id="step2" class="step">
    <h2>📁 Step 1: Open Shopify Code Editor</h2>
    <ol>
      <li>Visit <code>https://admin.shopify.com/store/your-store-handle</code></li>
      <li>Go to <strong>Online Store > Themes</strong></li>
      <li>Click the <strong>3-dot menu > Edit code</strong></li>
    </ol>
    <p>📸 (Image for code editor access)</p>
    <img src="/Images/Open Shopify Code Editor.png" alt="Open Shopify Code Editor" style="width: 100%; border-radius: 8px; margin: 10px 0;" />
    <div class="nav-buttons"><button class="nav-btn" onclick="prevStep(1)">Previous</button><button class="nav-btn" onclick="nextStep(3)">Next Step</button></div>
  </div>
  <div id="step3" class="step">
    <h2>📂 Step 2: Add Snippet – <code>video-intro.liquid</code></h2>
    <ol>
      <li>Scroll to <strong>Snippets</strong></li>
      <li>Click <strong>Add new snippet</strong></li>
      <li>Name it <code>video-intro</code></li>
      <li>Paste the code below:</li>
    </ol>
    <div class="code-block">
      <pre><code>&lt;!-- Shopify video intro code --&gt;</code></pre>
      <button class="copy-btn" onclick="copyToClipboard(this)"><img src="/Shopify_logo_2018.svg" alt="Shopify Icon" /> Copy video-intro.liquid</button>
    </div>
    <p>📸 (Image for pasting snippet)</p>
    <img src="/Images/Add Snippet – \`video-intro.liquid\` step 2.png" alt="Add Snippet – video-intro.liquid" style="width: 100%; border-radius: 8px; margin: 10px 0;" />
    <div class="nav-buttons"><button class="nav-btn" onclick="prevStep(2)">Previous</button><button class="nav-btn" onclick="nextStep(4)">Next Step</button></div>
  </div>
  <div id="step4" class="step">
    <h2>⚙️ Step 3: Update <code>settings_schema.json</code></h2>
    <p>Paste the following block <em>after the <code>theme_support_url</code></em>:</p>
    <div class="code-block">
      <pre><code>{ ... settings schema ... }</code></pre>
      <button class="copy-btn" onclick="copyToClipboard(this)"><img src="/Shopify_logo_2018.svg" alt="Shopify Icon" /> Copy settings_schema.json</button>
    </div>
    <p>📸 (Image for settings_schema.json)</p>
    <img src="/Images/Update \`settings_schema.json\`.png" alt="Update settings_schema.json" style="width: 100%; border-radius: 8px; margin: 10px 0;" />
    <div class="nav-buttons"><button class="nav-btn" onclick="prevStep(3)">Previous</button><button class="nav-btn" onclick="nextStep(5)">Next Step</button></div>
  </div>
  <div id="step5" class="step">
    <h2>🧩 Step 4: Embed Snippet in <code>theme.liquid</code></h2>
    <p>Find this line:</p>
    <pre><code>&lt;link rel="canonical" href="{{ canonical_url }}"&gt;</code></pre>
    <p>Paste this line <strong>below it</strong>:</p>
    <div class="code-block">
      <pre><code>{% render 'video-intro' %}</code></pre>
      <button class="copy-btn" onclick="copyToClipboard(this)"><img src="/Shopify_logo_2018.svg" alt="Shopify Icon" /> Copy theme.liquid snippet</button>
    </div>
    <p>📸 (Image for theme.liquid)</p>
    <img src="/Images/Embed Snippet in \`theme.liquid\`.png" alt="Embed Snippet in theme.liquid" style="width: 100%; border-radius: 8px; margin: 10px 0;" />
    <div class="nav-buttons"><button class="nav-btn" onclick="prevStep(4)">Previous</button><button class="nav-btn" onclick="nextStep(6)">Next Step</button></div>
  </div>
  <div id="step6" class="step">
    <h2>🎨 Step 5: Customize Settings</h2>
    <p>Available in Theme Editor:</p>
    <table class="settings-table">
      <tr><th>Setting</th><th>Description</th></tr>
      <tr><td>Background Audio</td><td>Upload .mp3</td></tr>
      <tr><td>Desktop Video</td><td>Upload .mp4 for desktop</td></tr>
      <tr><td>Mobile Video</td><td>Upload .mp4 for mobile</td></tr>
      <tr><td>Audio Volume</td><td>Adjust from 0–100%</td></tr>
      <tr><td>Skip Button Text</td><td>Customize or hide</td></tr>
      <tr><td>Skip Button Color</td><td>Change text/border color</td></tr>
    </table>
    <img src="/Images/Customize Settings.png" alt="Customize Settings" style="width: 10%; border-radius: 8px; margin: 10px auto; display: block;" />
    <div class="nav-buttons"><button class="nav-btn" onclick="prevStep(5)">Previous</button><button class="nav-btn" onclick="nextStep(7)">Next Step</button></div>
  </div>
  <div id="step7" class="step">
    <h2>🔍 Step 6: Preview and Test</h2>
    <ol>
      <li>Go to your Shopify store’s front page</li>
      <li>You should now see a full-screen branded video intro</li>
      <li>Skip button will appear (if enabled)</li>
      <li>Audio plays (if configured)</li>
    </ol>
    <p>🎉 Congrats! You now have an immersive Shopify intro experience</p>
    <div class="nav-buttons"><button class="nav-btn" onclick="prevStep(6)">Previous</button><button class="nav-btn" onclick="nextStep(8)">Next</button></div>
  </div>
  <div id="step8" class="step">
    <h2>🤝 Support</h2>
    <p>Need help or want a custom version? Reach out anytime on code.commerce999@gmail.com.<br/>Created with ❤️ by Code & Commerce<br/></p>
    <div class="nav-buttons"><button class="nav-btn" onclick="prevStep(7)">Previous</button></div>
  </div>
</div>
<textarea id="video-intro-liquid-code" style="display:none;">...liquid code...</textarea>
<textarea id="settings-schema-json-code" style="display:none;">...schema json...</textarea>
<textarea id="theme-liquid-code" style="display:none;">{% render 'video-intro' %}</textarea>
`;

const js = `const steps = document.querySelectorAll('.step'); let currentStep = -1; function startGuide(){ const header=document.querySelector('.header'); const guide=document.getElementById('guide'); header.classList.add('clicked'); setTimeout(()=>{ guide.classList.add('active'); },500); showStep(0);} function showStep(i){ steps.forEach((s,idx)=>{ s.classList.toggle('active', idx===i); }); currentStep=i;} function nextStep(i){ showStep(i);} function prevStep(i){ showStep(i);} function copyToClipboard(btn){ let textToCopy=''; if(btn.textContent.includes('video-intro.liquid')){ textToCopy=document.getElementById('video-intro-liquid-code').value; } else if(btn.textContent.includes('settings_schema.json')){ textToCopy=document.getElementById('settings-schema-json-code').value; } else if(btn.textContent.includes('theme.liquid')){ textToCopy=document.getElementById('theme-liquid-code').value; } const ta=document.createElement('textarea'); ta.value=textToCopy; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); const original=btn.innerHTML; btn.innerHTML='<img src="/Shopify_logo_2018.svg" alt="Shopify Icon" /> Copied!'; setTimeout(()=>{ btn.innerHTML=original; },2000);} `;

export default function Home() {
  return (
    <>
      <Head>
        <title>Shopify Video Intro Guide</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div dangerouslySetInnerHTML={{ __html: markup }} />
      <script dangerouslySetInnerHTML={{ __html: js }} />
    </>
  )
}
