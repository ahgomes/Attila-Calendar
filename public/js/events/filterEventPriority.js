function sortTable(n) {
    //sort eventsTable by priority column
    table = document.getElementById("eventsTable")
    switching = true
    direction = "asc"

    while (switching) {
        switching = false
        rows = table.rows
        
        for (i = 0; i < (rows.length - 1); i++) {
            shouldSwitch = false
            x = rows[i].getElementsByTagName("td")[n]
            y = rows[i + 1].getElementsByTagName("td")[n]

            if (direction == "asc") {
                if (Number(x.innerHTML) > Number(y.innerHTML)) {
                    shouldSwitch = true
                    break
                }
            } else if (direction == "desc") {
                if (Number(x.innerHTML) < Number(y.innerHTML)) {
                    shouldSwitch = true
                    break
                }
            }
        }

        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i])
            switching = true
            switchCount = switchCount + 1
        } else {
            if (switchCount == 0 && direction == "asc") {
                direction = "desc"
                switching = true
            }
        }
    }
}