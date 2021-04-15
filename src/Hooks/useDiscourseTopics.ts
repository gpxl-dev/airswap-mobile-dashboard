import axios from "axios";
import Discourse, { Tag } from "discourse-js";
import { useEffect } from "react";

const userApiKey = process.env.REACT_APP_DISCOURSE_API_KEY;
const apiUsername = process.env.REACT_APP_DISCOURSE_USERNAME;
const baseUrl =
  "https://api.codetabs.com/v1/proxy/?quest=https://community.airswap.io";

const discourse = new Discourse(userApiKey!, baseUrl);

const useDiscourseTopics = () => {
  useEffect(() => {
    const getProposalDiscussions = async () => {
      const category = await discourse.categories.getCategory({
        cat_id: 5,
        latest: true,
      });
      const topics = category.topicList.topics.filter(
        (t) =>
          t.title.startsWith("AIP") &&
          // @ts-ignore because the type definitions in the library are wrong
          (t.tags?.includes("draft") || t.tags?.includes("review"))
      );
      console.log(topics.map((t) => t.title));
    };
    getProposalDiscussions();
  }, []);
};

export default useDiscourseTopics;
