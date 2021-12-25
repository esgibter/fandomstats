from flask_restful import reqparse, Resource, abort
from ..model import AO3data, AO3url
from flask import request


class Stats(Resource):
    def _init_parser(self):
        # Arguments
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("type", type=str)
        self.parser.add_argument(
            "tag_id", required=True, type=str, help="A tag must be specified!"
        )
        self.parser.add_argument("page", type=int)
        self.parser.add_argument("sort_direction", type=str)
        self.parser.add_argument("query", type=str)
        self.parser.add_argument("title", type=str)
        self.parser.add_argument("creator", type=str)
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
        self.parser.add_argument("fandom_names", type=str, action="append")
        self.parser.add_argument("fandom_names[]", type=str, action="append")
        self.parser.add_argument("fandom_ids", type=int, action="append")
        self.parser.add_argument("fandom_ids[]", type=int, action="append")
        self.parser.add_argument("character_names", type=str, action="append")
        self.parser.add_argument("character_names[]", type=str, action="append")
        self.parser.add_argument("character_ids", type=int, action="append")
        self.parser.add_argument("character_ids[]", type=int, action="append")
        self.parser.add_argument("relationship_names", type=str, action="append")
        self.parser.add_argument("relationship_names[]", type=str, action="append")
        self.parser.add_argument("relationship_ids", type=int, action="append")
        self.parser.add_argument("relationship_ids[]", type=int, action="append")
        self.parser.add_argument("freeform_names", type=str, action="append")
        self.parser.add_argument("freeform_names[]", type=str, action="append")
        self.parser.add_argument("freeform_ids", type=int, action="append")
        self.parser.add_argument("freeform_ids[]", type=int, action="append")
        self.parser.add_argument("other_tag_names", type=str, action="append")
        self.parser.add_argument("other_tag_names[]", type=str, action="append")
        self.parser.add_argument("other_tag_ids", type=int, action="append")
        self.parser.add_argument("other_tag_ids[]", type=int, action="append")
        self.parser.add_argument("word_count", type=str)
        self.parser.add_argument("hits", type=str)
        self.parser.add_argument("kudos_count", type=str)
        self.parser.add_argument("comments_count", type=str)
        self.parser.add_argument("bookmarks_count", type=str)

    # Stats for any search filter
    def get(self):
        # Returns stats for any list of search arguments
        print("-------------------------")
        print("======= NEW CYCLE =======")
        try:
            self._init_parser()
        except Exception as e:
            abort(500, 'Unable to initialize argument parser')

        s = AO3data(request.url)
        url = AO3url()
        args = self.parser.parse_args()
        # print "parsed args:"
        # print args
        serialArgs = [
            "rating_ids",
            "warning_ids",
            "category_ids",
            "fandom_names",
            "fandom_ids",
            "character_names",
            "character_ids",
            "relationship_names",
            "relationship_ids",
            "freeform_names",
            "freeform_ids",
            "other_tag_names",
            "other_tag_ids",
        ]

        for sArg in serialArgs:
            if args[sArg] == None and args[sArg + "[]"] == None:
                continue
            if args[sArg + "[]"] == None:
                continue
            if args[sArg] == None:
                args[sArg] = args[sArg + "[]"]
                args.pop(sArg + "[]")
                continue
            else:
                args[sArg] = args[sArg] + args[sArg + "[]"]
                args.pop(sArg + "[]")

        # import pdb
        # pdb.set_trace()
        url.setFilters(args)
        parsed_url = url.getUrl()
        print("parsed url:")
        print(parsed_url)
        return s.getTopInfo(parsed_url)
