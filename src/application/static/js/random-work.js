//QUERY GET PARAM PARSER
$(document).ready(function () {
    var tagMatch = window.location.search.match(/^\?tags=(.+)/i);
    var urlMatch = window.location.search.match(/^\?url=(.+)/i);
    if (urlMatch != null) {
        query = fixedDecodeURIComponent(urlMatch[1]);
        console.log("decoded query: " + query);
        $("#url").val(query);
        $(".searchform").submit();
    } else if (tagMatch != null) {
        query = fixedDecodeURIComponent(tagMatch[1]);
        console.log("decoded query: " + query);
        $("#tags").val(query);
        $(".searchform").submit();
    }
});

function renderWork(workDiv, work) {
    workTags = work.tags.map(tag =>{
        return `<li class="work-card__tag word-card__tag--${tag.type}">${tag.name}</li>`;
    })
    workFandoms = work.fandoms.map(fandom => {
        return `<li class="work-card__fandom">${fandom}</li>`;
    })
    workCard = $(`<div class="work-card">
        <h4 class="work-card__heading"><a class="work-card__title" href="${work.url}">${work.title}</a> by ${work.author}</h4>
        <ul class="work-card__fandoms">
        ${workFandoms.join(', ')}
        </ul>
        <ul class="work-card__tags">
        ${workTags.join(', ')}
        </ul>
        <hr />
        <p class="work-card__length>${work.words} words</p>
        ${work.summary}
    </div>`)
    workDiv.append(workCard)

    workControls = $(`<div class="work-controls row collapse">
        <div class="medium-4 column">
            <button type="submit" class="small work-controls__redo" id="search-btn">Maybe something else...?</button>
        </div>
        <div class="medium-2 column textright">
            <a href="${work.url}" class="button small">Yes please!</a>
        </div>
    </div>`)
    workControls.find("#search-btn").click(() => {
        $(".searchform").submit();
    })
    workDiv.append(workControls)
}

$(".searchform").submit(function (e) {
    e.preventDefault();
    searchform = $(this);
    searchform.find(".form-info").remove();
    searchform.find(".permalink-div").remove();
    workDiv = $("#random-work");
    workDiv.html("");

    var button = searchform.find("#search-btn");
    button.prop("disabled", true)
    var buttonContent = button.html();
    button.find(".button-text").css("visibility", "hidden");
    spinnerDiv = $(`<div class="spinner-div"></div>`).append($("#spinner").clone().show());
    button.append(spinnerDiv);

    apiUrl = "/api/v1.0/work/random";
    var searchUrl = $("#url").val();
    var tagString = $("#tags").val();
    var tags = tagString.split(",");
    tags = tags.map(tag => tag.trim())

    main_tag = tags[0];
    other_tags = tags.slice(1);

    var permalink;
    if (searchUrl) {
        permalink = `?url=${fixedEncodeURIComponent(searchUrl)}`
    } else {
        permalink = `?tags=${fixedEncodeURIComponent(tagString)}`
    }

    console.log(`permalink: ${permalink}`);

    var data = {
        tag_id: main_tag,
        other_tag_names: other_tags,
        url: searchUrl,
    };

    $.ajax({
        url: apiUrl,
        data,
        success: function (result, status, object) {
            $("#random-work").show('fast');
            if (result.item && typeof result.item === 'object') {
                console.log(result._meta);
                console.log(result.item);
                renderWork(workDiv, result.item);
                
                permalinkElement = $(`<div class="medium-10 column permalink-div textright">
                <a href="${permalink}" class="permalink">(permalink)</a>
            </div>`)
                $('.submit-row').append(permalinkElement);
                return;
            }
            console.log(result);
            var { error = {} } = object;
            searchform.append(`<p class="form-info">${error.message}</p>`);
        },
        error: function (object, exception) {
            console.log(object);
            $("#random-work").html("");
            var {responseJSON = {}} = object;
            var {error = {}} = responseJSON;
            searchform.append(`<p class="form-info">${error.message}</p>`);
        },
        complete: function (object, status) {
            button.find("#spinner").remove();
            button.find(".button-text").css("visibility","visible");
            button.prop("disabled", false)
        }
    });

});

