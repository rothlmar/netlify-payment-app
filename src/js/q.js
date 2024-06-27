function setPrint() {
    const closePrint = () => { document.body.removeChild(this); };
    this.contentWindow.onbeforeunload = closePrint;
    this.contentWindow.onafterprint = closePrint;
    this.contentWindow.print();
}

function parseReceiptHtml(html) {
    const merchantName = html.getElementsByClassName('text-primary')[0].innerText;

    const address = [];
    for (let item of html.getElementsByClassName('receipt-address')) {
        address.push(item.innerText);
    }
    
    const metadata = [];
    for (let item of html.getElementsByClassName('text-tertiary')) {
        metadata.push(item.innerText);
    }

    const items = [];
    const itemNames = html.getElementsByClassName('item-name');
    const amounts = html.getElementsByClassName('currency');
    for (var idx = 0; idx < itemNames.length; idx++) {
        items.push([itemNames[idx].innerText, amounts[0].innerText]);
    }
    
    const purchaseTotalElt = html.getElementsByClassName('purchase-total');
    const purchaseTotal = [purchaseTotalElt[0].innerText, purchaseTotalElt[1].innerText];
    
    const result = { merchantName, address, metadata, items, purchaseTotal };
    return result;
}

function generatePdf(receiptData) {
    const jsPDF = window.jspdf.jsPDF;
    const doc = new jsPDF({
        orientation: "portrait",
        format: "letter",
        unit: "px",
        hotfixes: ["px_scaling"]
    });

    const lineAdjustment = 1.4;
    const xMargin = 40;
    let yCursor = 40;
    let fontSize = 22;

    doc.setLineWidth(4);
    doc.setFont('courier', 'bold');
    doc.setFontSize(fontSize);
    doc.text(receiptData.merchantName, xMargin, yCursor);
    yCursor += fontSize*lineAdjustment;

    fontSize = 16;
    doc.setFont('courier');
    doc.setFontSize(fontSize);
    doc.text(receiptData.address, xMargin, yCursor);
    doc.text(receiptData.metadata.slice(0,receiptData.metadata.length-1), xMargin + 450, yCursor);
    yCursor += Math.max(receiptData.address.length, receiptData.metadata.length-1)*fontSize*lineAdjustment;
    
    doc.line(xMargin + 10,yCursor,450,yCursor);
    yCursor += 40;

    doc.text(receiptData.items.map(i => `${i[0]}:\t\t\ ${i[1]}`), xMargin, yCursor);
    yCursor += receiptData.items.length*fontSize*lineAdjustment;

    fontSize = 18;
    doc.setFont('courier', 'bold');
    doc.setFontSize(fontSize);
    doc.text(`${receiptData.purchaseTotal[0]}:\t\t\t${receiptData.purchaseTotal[1]}`, xMargin, yCursor);
    yCursor+= fontSize*lineAdjustment;

    doc.line(xMargin + 10, yCursor, 450, yCursor);
    yCursor += 40;

    fontSize = 16;
    doc.setFont('courier');
    doc.setFontSize(fontSize);
    doc.text(receiptData.metadata[receiptData.metadata.length-1], xMargin, yCursor);

    return doc;
}

function setPdf() {
    const html = this.contentWindow.document.body;
    const receiptData = parseReceiptHtml(html);
    const doc = generatePdf(receiptData);
    const receiptName = `${receiptData.merchantName} receipt`

    doc.save(receiptName);
}

function sharePdf() {
    const html = this.contentWindow.document.body;
    const receiptData = parseReceiptHtml(html);
    const doc = generatePdf(receiptData);
    const receiptName = `${receiptData.merchantName} receipt`

    const fileByteArray = doc.output("arraybuffer");
    const pdf = new File([fileByteArray], `${receiptName}.pdf`, {type: "application/pdf"});
    const files = [pdf];
    if (navigator.canShare({ files })) {
        navigator.share({ files });
    } else {
        alert('navigator not able to share file');
        doc.save(receiptName);
    }
}

function pdfReceipt(payment_id) {
    const url = `/p/${payment_id}`;
    console.log(`creating pdf for ${payment_id}`);
    const hideFrame = document.createElement('iframe');
    hideFrame.onload = setPdf;
    hideFrame.style.display = "none";
    hideFrame.src = url;
    document.body.appendChild(hideFrame);
}

function printReceipt(payment_id) {
    const url = `/p/${payment_id}`;
    console.log(`sharing receipt for ${payment_id}`);
    const hideFrame = document.createElement('iframe');
    hideFrame.onload = setPrint;
    hideFrame.style.display = "none";
    hideFrame.src = url;
    document.body.appendChild(hideFrame);
}

function sharePdfReceipt(payment_id) {
    const url = `/p/${payment_id}`;
    console.log(`creating pdf for ${payment_id}`);
    const hideFrame = document.createElement('iframe');
    hideFrame.onload = sharePdf;
    hideFrame.style.display = "none";
    hideFrame.src = url;
    document.body.appendChild(hideFrame);
}

function captureImageAndShare(html) {
    // Remove sections with prominent images since we can't display them
    // at the moment due to CORS errors.
    const profileImage = html.getElementsByClassName("profile_image_position")[0];
    profileImage?.remove();
    const feedbackBox = html.getElementsByClassName("feedback-tile-box")[0];
    feedbackBox?.parentElement?.remove();

    // Remove footer since the links are not clickable in an image.
    const tableFooter = html.getElementsByClassName("table-footer")[0];
    tableFooter?.children[0].remove();
    tableFooter.style.height = "87px";

    html2canvas(html).then(canvas => {
        canvas.toBlob(blob => {
            const img = new File([blob], 'receipt.png', { type: 'image/png' });
            const files = [img];
            navigator.share({ files });
        });
    });
}

function shareImageReceipt(payment_id) {
    const url = `/r/${payment_id}`;
    console.log(`creating image for ${payment_id}`);
    const hideFrame = document.createElement('iframe');
    hideFrame.onload = function () {
        const html = hideFrame.contentWindow.document.body;
        captureImageAndShare(html);
    };
    hideFrame.style.display = "none";
    hideFrame.src = url;
    document.body.appendChild(hideFrame);
}

window.onload = (event) => {
    const payment_id = window.location.pathname.split('/')[2];
    console.log(`payment_id: ${payment_id}`);
    const iframectr = document.getElementById("iframectr");
    const iframe = document.createElement('iframe');
    iframe.style.width="100%";
    iframe.style.height="1000px";
    iframe.src = "/r/" + payment_id;
    iframectr.appendChild(iframe);

    const button = document.getElementById("sharebutton");
    button.addEventListener("click", (event) => {
    if (!navigator.canShare) {
        // printReceipt(payment_id);
        pdfReceipt(payment_id);
    } else {
        // sharePdfReceipt(payment_id);
        shareImageReceipt(payment_id);
    }
    });
}
