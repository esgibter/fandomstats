from flask_restful import reqparse, abort, Api, Resource
from flask import render_template, jsonify, request
from flask import Blueprint
from .models import AO3data, AO3url

api = Blueprint(
    'api',
    __name__,
    template_folder='templates',
    static_folder='static',
    url_prefix='/api'
)

# VIEWS


version_base = '/v1.0'
a = Api(api, prefix=version_base)

try:
    # Arguments
    parser = reqparse.RequestParser()
    parser.add_argument("type", type=str)
    parser.add_argument("tag_id", required=True, type=str,
                        help="A tag must be specified!")
    parser.add_argument("page", type=int)
    parser.add_argument("sort_direction", type=str)
    parser.add_argument("query", type=str)
    parser.add_argument("title", type=str)
    parser.add_argument("creator", type=str)
    parser.add_argument("revised_at", type=str)
    parser.add_argument("complete", type=int)
    parser.add_argument("single_chapter", type=int)
    parser.add_argument("sort_column", type=str)
    parser.add_argument("rating_ids", type=int, action="append")
    parser.add_argument("rating_ids[]", type=int, action="append")
    parser.add_argument("warning_ids", type=int, action="append")
    parser.add_argument("warning_ids[]", type=int, action="append")
    parser.add_argument("category_ids", type=int, action="append")
    parser.add_argument("category_ids[]", type=int, action="append")
    parser.add_argument("fandom_names", type=str, action="append")
    parser.add_argument("fandom_names[]", type=str, action="append")
    parser.add_argument("fandom_ids", type=int, action="append")
    parser.add_argument("fandom_ids[]", type=int, action="append")
    parser.add_argument("character_names", type=str, action="append")
    parser.add_argument("character_names[]", type=str, action="append")
    parser.add_argument("character_ids", type=int, action="append")
    parser.add_argument("character_ids[]", type=int, action="append")
    parser.add_argument("relationship_names", type=str, action="append")
    parser.add_argument("relationship_names[]", type=str, action="append")
    parser.add_argument("relationship_ids", type=int, action="append")
    parser.add_argument("relationship_ids[]", type=int, action="append")
    parser.add_argument("freeform_names", type=str, action="append")
    parser.add_argument("freeform_names[]", type=str, action="append")
    parser.add_argument("freeform_ids", type=int, action="append")
    parser.add_argument("freeform_ids[]", type=int, action="append")
    parser.add_argument("other_tag_names", type=str, action="append")
    parser.add_argument("other_tag_names[]", type=str, action="append")
    parser.add_argument("other_tag_ids", type=int, action="append")
    parser.add_argument("other_tag_ids[]", type=int, action="append")
    parser.add_argument("word_count", type=str)
    parser.add_argument("hits", type=str)
    parser.add_argument("kudos_count", type=str)
    parser.add_argument("comments_count", type=str)
    parser.add_argument("bookmarks_count", type=str)
except Exception as e:
    print(e)


class Stats(Resource):

  # Stats for any search filter
  def get(self):
    #Returns stats for any list of search arguments
    print("-------------------------")
    print("======= NEW CYCLE =======")
    s = AO3data(request.url)
    url = AO3url()
    args = parser.parse_args()
    #print "parsed args:"
    #print args
    serialArgs = [
        'rating_ids',
        'warning_ids',
        'category_ids',
        'fandom_names',
        'fandom_ids',
        'character_names',
        'character_ids',
        'relationship_names',
        'relationship_ids',
        'freeform_names',
        'freeform_ids',
        'other_tag_names',
        'other_tag_ids',
    ]

    for sArg in serialArgs:
        if (args[sArg] == None and args[sArg + '[]'] == None):
            continue
        if (args[sArg+'[]'] == None):
            continue
        if (args[sArg] == None):
            args[sArg] = args[sArg+'[]']
            args.pop(sArg + '[]')
            continue
        else:
            args[sArg] = args[sArg]+args[sArg + '[]']
            args.pop(sArg + '[]')

    # import pdb
    # pdb.set_trace()
    url.setFilters(args)
    parsed_url = url.getUrl()
    print("parsed url:")
    print(parsed_url)
    return s.getTopInfo(parsed_url)


class TagStats(Resource):

  # Stats for just a given tag id
  def get(self, tag_id):
    # todo: possibly remove completely? possibly unnecessary?
    # todo: add error handling for empty tagid
    params = {
        "type": "works",
        "params": {
            "tag_id": tag_id
        }
    }
    s = AO3data()
    url = AO3url().getUrl(params)
    return s.getTopInfo(url)


# API routing
a.add_resource(Stats, "/stats")
a.add_resource(TagStats, "/stats/tag/<string:tag_id>")
