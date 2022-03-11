$.ajaxSetup({
    contentType: "application/json; charset=utf-8",
    error: function (xhr) {
        const conn = document.getElementById("connected");
        conn.className = "notconnected";
        conn.innerHTML = "NOT CONNECTED";
      }
});

window.onload = function () {
    wireEvents();
    showInfoTab("send");
    connect();
}

function wireEvents() {
    const from = document.getElementById("from");
    from.addEventListener(
        'change',
        fromBalance,
        false
    );

    const to = document.getElementById("to");
    to.addEventListener(
        'change',
        toBalance,
        false
    );

    const send = document.getElementById("sendbutton");
    send.addEventListener(
        'click',
        showInfoTabSend,
        false
    );

    const tran = document.getElementById("tranbutton");
    tran.addEventListener(
        'click',
        showInfoTabTran,
        false
    );

    const sendsubmit = document.getElementById("sendsubmit");
    sendsubmit.addEventListener(
        'click',
        submitTran,
        false
    );

    const sendamount = document.getElementById("sendamount");
    sendamount.addEventListener(
        'keyup',
        formatCurrencyKeyup,
        false
    );
    sendamount.addEventListener(
        'blur',
        formatCurrencyBlur,
        false
    );
}

// =============================================================================

function connect() {
    const url = "http://localhost:8080/v1/genesis/list"

    $.get(url, function (o, status) {
        const conn = document.getElementById("connected");

        if ((typeof o.errors != "undefined") && (o.errors.length > 0)) {    
            conn.className = "notconnected";
            conn.innerHTML = "NOT CONNECTED";
            return;
        }

        conn.className = "connected";
        conn.innerHTML = "CONNECTED";

        fromBalance();
        toBalance();

        return
    });
}

// =============================================================================

function fromBalance() {
    const url = "http://localhost:8080/v1/accounts/list/" + document.getElementById("from").value;

    $.get(url, function (o, status) {
        if ((typeof o.errors != "undefined") && (o.errors.length > 0)) {    
            window.alert("ERROR: " + o.errors[0].message);
            return;
        }

        const bal = document.getElementById("frombal");
        bal.innerHTML = formatter.format(o.accounts[0].balance) + " ARD";
    });
}

function toBalance() {
    const url = "http://localhost:8080/v1/accounts/list/" + document.getElementById("to").value;

    $.get(url, function (o, status) {
        if ((typeof o.errors != "undefined") && (o.errors.length > 0)) {    
            window.alert("ERROR: " + o.errors[0].message);
            return;
        }

        const bal = document.getElementById("tobal");
        bal.innerHTML = formatter.format(o.accounts[0].balance) + " ARD";
    });
}

// =============================================================================

function submitTran() {
    const amount = document.getElementById("sendamount");

    var wallet = new ethers.Wallet("9f332e3700d8fc2446eaf6d15034cf96e0c2745e40353deef032a5dbf1dfed93");
        
    const tx = {
        nonce: 10,
        to: "0xbEE6ACE826eC3DE1B6349888B9151B92522F7F76",
        value: 100,
        tip: 10,
        data: null,
    };

    const txHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(JSON.stringify(tx)));
    const bytes = ethers.utils.arrayify(txHash);

    signature = wallet.signMessage(bytes);
    signature.then((sig) => sendTran(tx, sig));
}

function sendTran(tx, sig) {
    const signedTx = {
        nonce: 10,
        to: "0xbEE6ACE826eC3DE1B6349888B9151B92522F7F76",
        value: 100,
        tip: 10,
        data: "",
        sig: sig
    };
    
    alert(JSON.stringify(signedTx));
}

// =============================================================================

var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  
    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

// =============================================================================

function showInfoTabSend() {
    showInfoTab("send");
}

function showInfoTabTran() {
    showInfoTab("tran");
}

function showInfoTab(which) {
    const sendBox = document.querySelector("div.sendbox");
    const tranBox = document.querySelector("div.tranbox");

    const sendBut = document.getElementById("sendbutton");
    const tranBut = document.getElementById("tranbutton");

    switch (which) {
        case "send":
            sendBox.style.display = "block";
            tranBox.style.display = "none";
            sendBut.style.backgroundColor = "#faf9f5";
            tranBut.style.backgroundColor = "#d9d8d4";
            break;
        case "tran":
            sendBox.style.display = "none";
            tranBox.style.display = "block";
            sendBut.style.backgroundColor = "#d9d8d4";
            tranBut.style.backgroundColor = "#faf9f5";
            break;
    }
}

// =============================================================================

function formatCurrencyKeyup() {
    formatCurrency($(this));
}

function formatCurrencyBlur() {
    formatCurrency($(this), "blur");
}

function formatNumber(n) {
  // format number 1000000 to 1,234,567
  return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function formatCurrency(input, blur) {
    // appends $ to value, validates decimal side
    // and puts cursor back in right position.
  
    // get input value
    var input_val = input.val();
    
    // don't validate empty input
    if (input_val === "") { return; }
    
    // original length
    var original_len = input_val.length;

    // initial caret position 
    var caret_pos = input.prop("selectionStart");
    
    // check for decimal
    if (input_val.indexOf(".") >= 0) {
      
        // get position of first decimal
        // this prevents multiple decimals from
        // being entered
        var decimal_pos = input_val.indexOf(".");

        // split number by decimal point
        var left_side = input_val.substring(0, decimal_pos);
        var right_side = input_val.substring(decimal_pos);

        // add commas to left side of number
        left_side = formatNumber(left_side);

        // validate right side
        right_side = formatNumber(right_side);
        
        // On blur make sure 2 numbers after decimal
        if (blur === "blur") {
        right_side += "00";
        }
    
        // Limit decimal to only 2 digits
        right_side = right_side.substring(0, 2);

        // join number by .
        input_val = "$" + left_side + "." + right_side;

    } else {
        
        // no decimal entered
        // add commas to number
        // remove all non-digits
        input_val = formatNumber(input_val);
        input_val = "$" + input_val;
        
        // final formatting
        if (blur === "blur") {
            input_val += ".00";
        }
    }
  
    // send updated string to input
    input.val(input_val);

    // put caret back in the right position
    var updated_len = input_val.length;
    caret_pos = updated_len - original_len + caret_pos;
    input[0].setSelectionRange(caret_pos, caret_pos);
}