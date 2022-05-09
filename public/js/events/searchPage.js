(function ($) {
    const DOMform = $('#search-form');

    const DOMoption = $('#searchOption'),
        DOMsearchTerm = $('#searchEvents');

    const DOMerror = $('#error');

    DOMform.submit(function (e) {
        
        let noErrors = true;

        let optionValue = null,
            searchTerm = null;

        try {
            if (!DOMoption.val()) throw `Error: Option must to have a selected value.`;
            optionValue = validateApi.isValidString(DOMoption.val(), true);
            if (optionValue !== "User" && optionValue !== "Title/Description" && optionValue !== "Priority" && optionValue !== "Date") {
                throw `Error: '${optionValue}' is not a valid search type.`
            }

            if (optionValue == "User" || optionValue == "Title/Description" || optionValue == "Date") {
                searchTerm = validateApi.isValidString(DOMsearchTerm.val(), true);
            }
            else {
                searchTerm = Number(DOMsearchTerm.val());
                searchTerm = validateApi.isValidNumber(searchTerm, true);
                if (searchTerm < 1 || searchTerm > 5) {
                    throw `Error: '${earchTerm}' is not a valid priority.`
                }
            }

            if (optionValue == "Date") {
                // TODO: Might have to account for lowercase input or validate for it
                let month = searchTerm.substring(0,2)
                let day = searchTerm.substring(3,5)
                let year = searchTerm.substring(6,12)
    
                day == "XX" ? dayValue = false : dayValue = Number(day)
                month == "XX" ? monthValue = false : monthValue = Number(month)
                year == "XXXX" ? yearValue = false : yearValue = Number(year)
    
                if (dayValue != false) {
                    if (isNaN(dayValue)) {
                        throw `Error: '${searchTerm}' is not a valid formatted date.`
                    }
                }
    
                if (monthValue != false) {
                    if (isNaN(monthValue)) {
                        throw `Error: '${searchTerm}' is not a valid formatted date.`
                    }
                }
    
                if (yearValue != false) {
                    if (isNaN(yearValue)) {
                        throw `Error: '${searchTerm}' is not a valid formatted date.`
                    }
                }
            }


            DOMerror.text('').hide();
        } catch (e) {
            noErrors = false;
            DOMerror.text(e).show();
        }
        

        if (!noErrors) e.preventDefault();
    });
})(window.jQuery);