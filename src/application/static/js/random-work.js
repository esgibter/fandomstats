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
    workDiv = $("#random-work");
    workDiv.html("");

    var button = searchform.find("#search-btn");
    button.prop("disabled", true)
    var buttonContent = button.html();
    button.html($("#spinner").clone().show());

    apiUrl = "/api/v1.0/work/random";
    var searchUrl = $("#url").val();
    var tagString = $("#tags").val();
    var tags = tagString.split(",");
    tags = tags.map(tag => tag.trim())

    main_tag = tags[0];
    other_tags = tags.slice(1);

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
                return renderWork(workDiv, result.item);
            }

            searchform.append(`<p class="form-info">${error.message}</p>`);
        },
        error: function (object, exception) {
            $("#random-work").html("");
            var {error = {}} = object;
            searchform.append(`<p class="form-info">${error.message}</p>`);
        },
        complete: function (object, status) {
            button.html(buttonContent); //loader back to text
            button.prop("disabled", false)
        }
    });

});

