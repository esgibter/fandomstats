from bs4.builder import TreeBuilderRegistry
from flask_restful import Resource, abort
from flask import redirect
from ..model import AO3url, Parser
from flask import request
from bs4 import BeautifulSoup
import requests
import random
import urllib


class RandomWork(Resource):
    def _init_parser(self):
        # Arguments
        self.parser = Parser()
        self.parser.add_argument("url",type=str)
        self.parser.add_argument("tag_id", type=str)        
        self.parser.add_argument("other_tag_names", type=str, action="append")
        self.parser.add_argument("other_tag_names[]", type=str, action="append")
        self.parser.add_argument("excluded_tag_names",type=str,action="append")
        self.parser.add_argument("excluded_tag_names[]",type=str,action="append")

    def fetchHTML(self, url):
        try:
            r = requests.get(url)
        except ValueError:
            raise ValueError(400,"")

        r.raise_for_status()

        final_url = r.url

        if final_url == url:
            soup = BeautifulSoup(r.text, "html.parser")
            soup.prettify()
            return soup
        
        # this tag cannot be filtered on
        if (final_url.find("/works") == -1):
            raise ValueError(404, "")
        else:
            #it's a "synned" tag (e.g. it's a synonym and AO3 automatically redirects)
            # import pdb
            # pdb.set_trace()
            print("this is a redirect...")
            canonical_tag = AO3url.tag_from_url(final_url)
            raise ValueError(302,canonical_tag)


    def get_work(self, soup):
        works = soup.findAll("li",class_="work")

        if not works:
            abort(500, status=500, message="No works found")

        random_work = works[random.randrange(1,len(works)-1)]

        work_dict = {
            "title": "",
            "author": "",
            "tags": [],
            "summary": "",
            "words": 0,
            "url": ""
        }

        try:
            heading = random_work.find("h4")
            heading_links = heading.findAll("a")

            work_dict["title"] = heading_links[0].text

            relative_work_path = heading_links[0].attrs["href"]
            work_dict["url"] = f"https://archiveofourown.org{relative_work_path}"

            work_dict["author"] = heading_links[1].text

            words_text = random_work.find("dd",class_="words").text
            work_dict["words"] = int(words_text.replace(",",""))

            work_dict["summary"] = random_work.find("blockquote", class_="summary").prettify()

            tag_list = random_work.find("ul", class_="tags")
            tags = tag_list.findAll("li")

            for tag in tags:
                work_dict["tags"].append({
                    "name":tag.string,
                    "type": tag.attrs["class"][0]
                })   

        except Exception as e:
            print(e)
            abort(500, status=500, message="Failed to parse AO3 page")

        return work_dict


    def get_error(self, status, message):
        return {
            "status": status,
            "message": message,
        }

    # get a random work
    def get(self):
        self._init_parser()
        args = self.parser.parse_args()

        
        payload = {}

        if not args["url"] and not args["tag_id"]:
            payload["error"] = self.get_error(400, "Specify either `url` or `tag_id` to search for works")
            abort(400, **payload)

        
        parsed_url = args["url"]
        if not parsed_url:
            url = AO3url()
            url.setFilters(args)
            parsed_url = url.getUrl()

        payload["_meta"] = {
                "searched_url": parsed_url
            }

        try:
            soup = self.fetchHTML(parsed_url)
        except ValueError as err:
            code, canonical = err.args
            if code ==302:
                proper_api_request = AO3url.replace_tag_in_url(request.url, canonical)
                # redirect to correct tag
                return redirect(proper_api_request)
            elif code == 404:
                #HTTP Status Code: 404 Not Found
                payload["error"] = self.get_error(404, "This tag cannot be filtered on.")
                abort(404, **payload)
            elif code == 400:
                #HTTP Status Code: 400 Bad request. Do not re-run again without modifying.
                payload["error"] = self.get_error(400, "Malformed AO3 URL.")
                abort(400, **payload)
            else:
                #HTTP Status Code: 500 Internal Server Error. Something went wrong on our side.
                payload["error"] = self.get_error(500, "HTTP request failed when trying to scrape Ao3!")
                abort(500, **payload)
 
        pagination = soup.findAll("ol",class_="pagination")[0]
    
        if not pagination:
            meta = {
                "total_pages": 1,
                "chosen_page": 1,
            }
            payload["_meta"] = {**payload["_meta"],**meta}
            payload["item"] = self.get_work(soup)
            return payload
            # pick from works on the page

        pagination_buttons = pagination.findAll("li")
        last_button = pagination_buttons[len(pagination_buttons)-2] # the last is "Next"
        last_page = int(last_button.text)
        random_page = random.randrange(1,last_page)
        page_url = AO3url.change_page(parsed_url,random_page)

        meta = {
            "total_pages": last_page,
            "chosen_page": random_page,
        }
        
        if last_page >= 5000:
            meta["warning"] = "This tag contains too many works, choosing only from last 5000 pages"
        payload["_meta"] = {**payload["_meta"],**meta}
        
        try:
            page_soup = self.fetchHTML(page_url)
            payload["item"] = self.get_work(page_soup)
            return payload
        except ValueError as err:
            payload["error"] = self.get_error(500, "Failed when looking up works")
            abort(500, **payload)
            