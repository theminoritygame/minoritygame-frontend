export function setupGameListDropDown(doc: Document, lastGameId: number, onSelectionChange: (gameId: number)=> void) {
    var dropdownDiv = doc.getElementById("dropdown")
    if(dropdownDiv) {
        dropdownDiv.innerHTML = "";
        for (let i = lastGameId; i >= 0; i--) {
            let option = doc.createElement("option");
            option.value = i.toString();
            option.text = "GameId: " + i.toString();
            dropdownDiv.appendChild(option);  
        }
        dropdownDiv.addEventListener("change", () => {
            if(dropdownDiv != null) {
                var dropdownValue = +((dropdownDiv as HTMLSelectElement).value) // selected value
                onSelectionChange(dropdownValue)
            }
        });
        (dropdownDiv as HTMLSelectElement).value = lastGameId.toString();
    }
}
