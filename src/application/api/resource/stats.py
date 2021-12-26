from flask_restful import reqparse, Resource, abort
from ..model import AO3data, AO3url, Parser
from flask import request


class Stats(Resource):
    def _init_parser(self):
        # Arguments
        self.parser = Parser()
        self.parser.add_filter_args()

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
        

        # import pdb
        # pdb.set_trace()
        url.setFilters(args)
        parsed_url = url.getUrl()
        print("parsed url:")
        print(parsed_url)
        return s.getTopInfo(parsed_url)
