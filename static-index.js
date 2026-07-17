(function () {
    var records = [];
    var visibleRecords = [];
    var traits = [
        "background",
        "special",
        "skin",
        "eye",
        "outfit",
        "face",
        "hat"
    ];

    var $grid = $("#recordsGrid");
    var $recordsWrap = $("#recordsWrap");
    var $loadingState = $("#loadingState");
    var $emptyState = $("#emptyState");
    var $queryInput = $("#queryInput");
    var $typeSelect = $("#typeSelect");
    var $attributeGrid = $("#attributeGrid");

    function extractRecords(exportJson) {
        var table = exportJson.find(function (item) {
            return item.type === "table" && item.name === "nft";
        });

        return (table && table.data ? table.data : []).sort(function (a, b) {
            return Number(a.rank) - Number(b.rank);
        });
    }

    function assetPath(path) {
        return "public/" + String(path || "").replace(/^\\?\//, "");
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderRecords(items) {
        $grid.empty();

        items.forEach(function (record) {
            var $item = $("<button/>", {
                type: "button",
                class: "col-6 col-sm-3 col-lg-2 nft-item",
                "data-toggle": "modal",
                "data-target": "#nftModal"
            });

            $item.data("record", record);
            $item.append(
                $("<img/>", {
                    class: "lazy",
                    "data-src": assetPath(record.media),
                    alt: "Tinker#" + record.token_id
                }),
                $("<h2/>").text(" Tinker#" + record.token_id + " "),
                $("<p/>").text(" Ranked #" + record.rank)
            );

            $grid.append($item);
        });

        if ($.fn.lazy) {
            $(".lazy").Lazy();
        } else {
            $(".lazy").each(function () {
                this.src = this.getAttribute("data-src");
            });
        }
    }

    function applySearch() {
        var query = $.trim($queryInput.val()).toLowerCase();
        var type = $typeSelect.val();

        if (!query) {
            visibleRecords = records;
        } else if (type === "rank") {
            visibleRecords = records.filter(function (record) {
                return String(record.rank) === query;
            });
        } else {
            visibleRecords = records.filter(function (record) {
                return String(record.token_id).indexOf(query) !== -1;
            });
        }

        renderRecords(visibleRecords);
        $recordsWrap.toggleClass("d-none", visibleRecords.length === 0);
        $emptyState.toggleClass("d-none", visibleRecords.length > 0);
    }

    function traitTitle(key) {
        return key.charAt(0).toUpperCase() + key.slice(1);
    }

    function renderTrait(key, record) {
        var title = traitTitle(key);
        var value = record[key] || "None";
        var percent = record[key + "_percent"] || "0%";
        var quantity = record[key + "_quantity"] || "0";
        var width = parseFloat(percent) || 0;

        return '' +
            '<div class="col-sm-6">' +
                '<div class="attr-item">' +
                    '<h2>' + title + ' : <span>' + escapeHtml(value) + '</span></h2>' +
                    '<span class="nftRarity">RARITY ' + escapeHtml(percent) + '</span>' +
                    '<div class="progress-bar-wrapper">' +
                        '<span class="progress-bar">' +
                            '<span class="progress-bar-fill" style="width:' + width + '%"></span>' +
                        '</span>' +
                    '</div>' +
                    '<small class="nftQuantity">' + escapeHtml(quantity) + ' items have this trait</small>' +
                '</div>' +
            '</div>';
    }

    function openModal(record) {
        $("#modalTitle").text("Tinker#" + record.token_id);
        $("#modalRank").text("Ranked #" + record.rank);
        $(".nftImage").attr({
            src: assetPath(record.media),
            alt: "Tinker#" + record.token_id
        });

        $attributeGrid.html(traits.map(function (key) {
            return renderTrait(key, record);
        }).join(""));
    }

    $("#searchForm").on("submit", function (event) {
        event.preventDefault();
        applySearch();
    });

    $grid.on("click", ".nft-item", function () {
        openModal($(this).data("record"));
    });

    $.getJSON("nft.json")
        .done(function (data) {
            records = extractRecords(data);
            visibleRecords = records;
            $loadingState.addClass("d-none");
            $recordsWrap.removeClass("d-none");
            applySearch();
        })
        .fail(function () {
            $("#loadingState #noResult").text("Unable to load ../nft.json. Please view this folder through a local web server.");
        });
}());

