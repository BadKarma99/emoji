
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";

import relativeTime from "dayjs/plugin/relativeTime";
import { RouterOutputs } from "../utils/api";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const  PostView = (props: PostWithUser) => {
    const { posts, auther } = props;
    return (
      <div key={posts.id} className="border-b border-slate-200 p-8 flex gap-3">
        <img src = {auther.profilePicture} className="h-10 w-10 rounded-full" />
        <div className="flex flex-col">
        <div className="flex gap-2 text-slate-500">
       <Link href={`/@${auther.name}`}> <span className="">{auther.name}</span> </Link>
        <Link href={`/posts/${posts.id}`}><span className="text-slate-500">{`- ${dayjs(posts.createdAt).fromNow()}`}</span>
        </Link>
        </div>
        <div>{posts.content}</div>
        </div>
      </div>
    );
  };