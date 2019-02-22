from flask import render_template, jsonify, request
from flask.ext.restful import reqparse, abort, Api, Resource
from application.api import api
from tags import AO3data, AO3url
from media import AO3MediaFandoms, AO3MediaList
import pdb

version_base = '/v1.0'
a = Api(api, prefix=version_base)


class TagStats(Resource):
  # Stats for any search filter
  def get(self):
    try:
      # Arguments
      self.parser = reqparse.RequestParser()
      self.parser.add_argument("type", type=str)
      self.parser.add_argument("tag_id", required=True, type=unicode, help="Please specify tag_id (tag to search, string).")
      self.parser.add_argument("page", type=int)
      self.parser.add_argument("sort_direction", type=str)
      self.parser.add_argument("query", type=str)
      self.parser.add_argument("title", type=unicode)
      self.parser.add_argument("creator", type=unicode)
      self.parser.add_argument("revised_at", type=str)
      self.parser.add_argument("complete", type=int)
      self.parser.add_argument("single_chapter", type=int)
      self.parser.add_argument("sort_column", type=str)
      self.parser.add_argument("rating_ids", type=int, action="append")
      self.parser.add_argument("rating_ids[]", type=int, action="append")
      self.parser.add_argument("warning_ids", type=int, action="append")
      self.parser.add_argument("warning_ids[]", type=int, action="append")
      self.parser.add_argument("category_ids", type=int, action="append")
      self.parser.add_argument("category_ids[]", type=int, action="append")
      self.parser.add_argument("fandom_names", type=unicode, action="append")
      self.parser.add_argument("fandom_names[]", type=unicode, action="append")
      self.parser.add_argument("fandom_ids", type=int, action="append")
      self.parser.add_argument("fandom_ids[]", type=int, action="append")
      self.parser.add_argument("character_names", type=unicode, action="append")
      self.parser.add_argument("character_names[]", type=unicode, action="append")
      self.parser.add_argument("character_ids", type=int, action="append")
      self.parser.add_argument("character_ids[]", type=int, action="append")
      self.parser.add_argument("relationship_names", type=unicode, action="append")
      self.parser.add_argument("relationship_names[]", type=unicode, action="append")
      self.parser.add_argument("relationship_ids", type=int, action="append")
      self.parser.add_argument("relationship_ids[]", type=int, action="append")
      self.parser.add_argument("freeform_names", type=unicode, action="append")
      self.parser.add_argument("freeform_names[]", type=unicode, action="append")
      self.parser.add_argument("freeform_ids", type=int, action="append")
      self.parser.add_argument("freeform_ids[]", type=int, action="append")
      self.parser.add_argument("other_tag_names", type=unicode, action="append")
      self.parser.add_argument("other_tag_names[]", type=unicode, action="append")
      self.parser.add_argument("other_tag_ids", type=int, action="append")
      self.parser.add_argument("other_tag_ids[]", type=int, action="append")
      self.parser.add_argument("word_count", type=str)
      self.parser.add_argument("hits", type=str)
      self.parser.add_argument("kudos_count", type=str)
      self.parser.add_argument("comments_count", type=str)
      self.parser.add_argument("bookmarks_count", type=str)
    except Exception as e:
      print e

    args = self.parser.parse_args()
    # Returns stats for any list of search arguments
    # print "-------------------------"
    # print "======= NEW CYCLE ======="
    s = AO3data(request.url)
    url = AO3url()

    # print "parsed args:"
    # print args
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
      if (args[sArg] is None and args[sArg + '[]'] is None):
        continue
      if (args[sArg + '[]'] is None):
        continue
      if (args[sArg] is None):
        args[sArg] = args[sArg + '[]']
        args.pop(sArg + '[]')
        continue
      else:
        args[sArg] = args[sArg] + args[sArg + '[]']
        args.pop(sArg + '[]')

    url.setFilters(args)
    parsed_url = url.getUrl()
    # print "parsed url:"
    # print parsed_url
    return s.getTopInfo(parsed_url)


# returns X largest fandoms for a medium (i.e. "Books & Literature" etc.)
class MediaStats(Resource):

  def get(self):
    print "========================="
    print "MediaStats"
    try:
      # Arguments
      self.parser = reqparse.RequestParser()
      self.parser.add_argument("num_fandoms", type=int)
      self.parser.add_argument("include_umbrella_fandoms", type=int)
      self.parser.add_argument("media_categories[]", type=unicode, action="append")
      self.parser.add_argument("media_categories", type=unicode, action="append")
    except Exception as e:
      print e

    args = self.parser.parse_args()
    print "args:"
    print args
    if (args['include_umbrella_fandoms'] is None):
      args['include_umbrella_fandoms'] = 0

    if not (args['media_categories[]'] is None):
      args['media_categories'] = args['media_categories[]']

    args.pop('media_categories[]')

    if (args['media_categories'] is None):
      args['media_categories'] = ["Anime & Manga", "Books & Literature", "Cartoons & Comics & Graphic Novels", "Celebrities & Real People", "Movies", "Music & Bands", "Other Media", "Theater", "TV Shows", "Video Games", "Uncategorized Fandoms"]

    args['umbrella_terms'] = ["Related Fandoms", "All Media Types", "Marvel Cinematic Universe", "DCU", "Jossverse", "Ambiguous Fandom", "Bandom", "K-pop", "Jpop", "Jrock", "Music RPF", "Actor RPF", "Sports RPF", "Blogging RPF", "Real Person Fiction", "Internet Personalities", "- Works", "Video Games", "MS Paint Adventures"]

    args['min_fandom_size'] = 1000

    m = AO3MediaFandoms(args)
    return m.getStats()


# existing media categories (allows for making separate MediaStats queries for single cats client-side, which should be less fragile)
class MediaCategories(Resource):

  def get(self):
    ml = AO3MediaList()
    return ml.getList()


# API routing
a.add_resource(TagStats, "/stats", "/stats/tag/<string:tag_id>")
a.add_resource(MediaStats, "/stats/media")
a.add_resource(MediaCategories, "/stats/media/list")
