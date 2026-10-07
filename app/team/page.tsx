import {getTeam} from "@/lib/credits";
import {TeamSpace} from "@/components/TeamSpace";
export default async function Page(){return <TeamSpace initial={await getTeam()}/>;}
