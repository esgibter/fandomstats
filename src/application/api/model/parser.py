from flask_restful import reqparse, Resource, abort

class Parser(reqparse.RequestParser):
    def add_filter_args(self):
        # Arguments
        self.add_argument("type", type=str)
        self.add_argument(
            "tag_id", required=True, type=str, help="A tag must be specified!"
        )
        self.add_argument("page", type=int)
        self.add_argument("sort_direction", type=str)
        self.add_argument("query", type=str)
        self.add_argument("title", type=str)
        self.add_argument("creator", type=str)
        self.add_argument("revised_at", type=str)
        self.add_argument("complete", type=int)
        self.add_argument("single_chapter", type=int)
        self.add_argument("sort_column", type=str)
        self.add_argument("rating_ids", type=int, action="append")
        self.add_argument("rating_ids[]", type=int, action="append")
        self.add_argument("warning_ids", type=int, action="append")
        self.add_argument("warning_ids[]", type=int, action="append")
        self.add_argument("category_ids", type=int, action="append")
        self.add_argument("category_ids[]", type=int, action="append")
        self.add_argument("fandom_names", type=str, action="append")
        self.add_argument("fandom_names[]", type=str, action="append")
        self.add_argument("fandom_ids", type=int, action="append")
        self.add_argument("fandom_ids[]", type=int, action="append")
        self.add_argument("character_names", type=str, action="append")
        self.add_argument("character_names[]", type=str, action="append")
        self.add_argument("character_ids", type=int, action="append")
        self.add_argument("character_ids[]", type=int, action="append")
        self.add_argument("relationship_names", type=str, action="append")
        self.add_argument("relationship_names[]", type=str, action="append")
        self.add_argument("relationship_ids", type=int, action="append")
        self.add_argument("relationship_ids[]", type=int, action="append")
        self.add_argument("freeform_names", type=str, action="append")
        self.add_argument("freeform_names[]", type=str, action="append")
        self.add_argument("freeform_ids", type=int, action="append")
        self.add_argument("freeform_ids[]", type=int, action="append")
        self.add_argument("other_tag_names", type=str, action="append")
        self.add_argument("other_tag_names[]", type=str, action="append")
        self.add_argument("other_tag_ids", type=int, action="append")
        self.add_argument("other_tag_ids[]", type=int, action="append")
        self.add_argument("word_count", type=str)
        self.add_argument("hits", type=str)
        self.add_argument("kudos_count", type=str)
        self.add_argument("comments_count", type=str)
        self.add_argument("bookmarks_count", type=str)

    
    def parse_args(self):
        args = super().parse_args()

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
            "excluded_tag_names"
        ]

        for sArg in serialArgs:
            if not sArg in args.keys():
                continue
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

        return args

