// Shared intake markup. Keep private data inside this root on every host page.
export const loanImportMarkup = `<section id="import-loan-history" class="loan-import" data-loan-private hidden aria-labelledby="loan-import-title">
  <p class="lt-eyebrow">Import loan history</p>
  <h2 id="loan-import-title">Bring your existing loan</h2>
  <p>Add a photo, file or notes for one loan. Review the result, then keep tracking it on your iPhone.</p>
  <div id="loan-import-intake">
    <h3>1. Choose how to import</h3>
    <div class="loan-import-source-choices" aria-label="Import source">
      <button type="button" id="loan-import-source-text" aria-expanded="false" aria-controls="loan-import-text-panel"><span class="loan-import-source-icon" aria-hidden="true">Aa</span><span><strong>Text</strong><small>Paste notes or a copied table</small></span><span aria-hidden="true">›</span></button>
      <button type="button" id="loan-import-source-document"><span class="loan-import-source-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h6"/></svg></span><span><strong>Document</strong><small>CSV, Excel (.xlsx), Word (.docx) or a saved loan draft · up to 2 MB</small></span><span aria-hidden="true">›</span></button>
      <button type="button" id="loan-import-source-photo" aria-expanded="false" aria-controls="loan-import-photo-options"><span class="loan-import-source-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m4 18 6-6 4 4 3-3 4 4"/></svg></span><span><strong>Photo</strong><small>Choose a photo or take one on your phone</small></span><span aria-hidden="true">›</span></button>
    </div>
    <div id="loan-import-photo-options" class="loan-import-actions" hidden>
      <p id="loan-import-photo-quality" class="loan-import-disclosure"></p>
      <button type="button" id="loan-import-photo-library">Choose from photo library</button>
      <button type="button" id="loan-import-photo-take" class="loan-import-camera-option">Take a photo</button>
      <p class="loan-import-hint">One image · up to 20 MB</p>
    </div>
    <input id="loan-import-file" type="file" accept=".csv,.xlsx,.docx,.uomiloan,.json" hidden />
    <input id="loan-import-photo" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" hidden />
    <input id="loan-import-camera" type="file" accept="image/*" capture="environment" hidden />
    <p id="loan-import-selected-document" hidden></p>
    <button type="button" id="loan-import-photo-notes" hidden>Add details (optional)</button>
    <div id="loan-import-text-panel" hidden>
      <label id="loan-import-text-label" for="loan-import-text">Paste notes or a table</label>
      <textarea id="loan-import-text" rows="4" placeholder="Who lent to whom? Include the currency, dates, loan amount and repayments." maxlength="48000"></textarea>
    </div>
    <details id="loan-import-image" hidden open><summary>Inspect your photo</summary><p>Check every amount and date against this photo before saving.</p><button id="loan-import-photo-zoom" type="button">Enlarge photo</button><img id="loan-import-image-preview" alt="Your selected loan record" /><button id="loan-import-photo-remove" type="button">Remove photo</button></details>
    <div id="loan-import-processing-actions" hidden>
      <p class="loan-import-disclosure">Review sends your input to You Owe Me and OpenAI. Check the result before saving. <a href="/privacy-and-data/#loan-import-privacy">Privacy and temporary storage</a>.</p>
      <div class="loan-import-actions"><button type="button" id="loan-import-interpret" class="lt-primaryCta">Review my loan</button></div>
    </div>
    <div class="loan-import-actions"><button type="button" id="loan-import-manual">Enter manually</button></div>
  </div>
  <p id="loan-import-status" role="status" aria-live="polite"></p>
  <div id="loan-import-loading" class="loan-import-loading" hidden tabindex="-1" aria-labelledby="loan-import-loading-title">
    <div class="loan-import-orbit" aria-hidden="true"><span class="loan-import-document"><i></i><i></i><i></i></span></div>
    <h3 id="loan-import-loading-title">Preparing your loan…</h3>
    <p id="loan-import-loading-note">Turning your history into a loan you can review.<br>This may take a few moments.</p>
    <button type="button" id="loan-import-cancel">Stop waiting</button>
  </div>
  <div id="loan-import-review" hidden></div>
  <div id="loan-import-transfer" hidden></div>
</section>`;
