globalThis.FashionGallery = globalThis.FashionGallery || {};

async function deliverFeedback(endpoint, payload, fetchImpl = fetch, timeoutMs = 20000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetchImpl(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });
        if (!response.ok) throw new Error("Submission not accepted");
        const data = await response.json();
        if (data.success !== true && data.success !== "true") throw new Error("Submission not confirmed");
    } finally {
        clearTimeout(timer);
    }
}

function initFeedbackDelivery({ form, outfit, readFeedback, showStatus }) {
    const sendButton = document.getElementById("send-feedback");
    if (!sendButton) return;
    const label = sendButton.querySelector("span");
    let sending = false;
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (sending) return;
        const feedback = readFeedback();
        if (!feedback) return;
        if (document.getElementById("website").value) return;
        const lookName = outfit.options[outfit.selectedIndex].textContent;
        const payload = { name: feedback.name, outfit: lookName, outfit_id: feedback.outfit, message: feedback.comment,
            _subject: "New feedback from the Fashion lookbook", _template: "table", _honey: "" };
        sending = true;
        sendButton.disabled = true;
        sendButton.setAttribute("aria-busy", "true");
        label.textContent = "Sending…";
        showStatus("Sending your feedback. Your text will stay here.");
        try {
            await deliverFeedback("https://formsubmit.co/ajax/barasaderrick499@gmail.com", payload);
            showStatus(`Your feedback on ${lookName} was submitted to the email service. Thank you for sharing.`, "success");
        } catch {
            showStatus("We could not confirm delivery. Your text is still here. Check your connection before trying again, or save a private copy on this device. If you already submitted, allow time for the email to arrive before retrying.", "error");
        } finally {
            sending = false;
            sendButton.disabled = false;
            sendButton.removeAttribute("aria-busy");
            label.textContent = "Send my feedback";
        }
    });
}

globalThis.FashionGallery.deliverFeedback = deliverFeedback;
globalThis.FashionGallery.initFeedbackDelivery = initFeedbackDelivery;
