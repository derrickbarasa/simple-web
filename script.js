function _selectOutfit(outfitName) {
    document.getElementById("outfit").value = outfitName;
}

function _validateForm() {
    const name = document.getElementById("name").value;
    const comment = document.getElementById("comment").value;

    if (name === "" || comment === "") {
        alert("Please fill all fields");
        return false;
    }

    alert("Feedback submitted!");
    return true;
}