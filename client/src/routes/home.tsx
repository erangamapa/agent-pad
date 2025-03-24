import { useQuery } from "@tanstack/react-query";
import { Cog } from "lucide-react";
import PageTitle from "@/components/page-title";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import { NavLink } from "react-router";
import { UUID } from "@elizaos/core";

export default function Home() {
    const query = useQuery({
        queryKey: ["agents"],
        queryFn: () => apiClient.getAgents(),
        refetchInterval: 5_000,
    });

    const agents = query?.data?.agents;

    return (
        <div className="flex flex-col gap-4 h-full p-4">
            <PageTitle title="Agents" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {agents?.map((agent: { id: UUID; name: string }) => (
                    <Card key={agent.id}>
                        <CardHeader>
                            <CardTitle>{agent?.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md bg-muted aspect-square w-full grid place-items-center">
                                <div className="text-6xl font-bold uppercase">
                                    <img
                                        src={
                                            agent?.name === "Agent Hoopz"
                                                ? "/agent_logo.png"
                                                : "agent_logo_2.webp"
                                        }
                                        alt={agent?.name}
                                        className="rounded-md"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <div className="flex items-center gap-4 w-full">
                                <NavLink
                                    to={`/chat/${agent.id}?name=${agent.name}`}
                                    className="w-full grow"
                                >
                                    <Button className="w-full grow btn-purple">
                                        Chat
                                    </Button>
                                </NavLink>
                                <NavLink
                                    to={`/settings/${agent.id}`}
                                    key={agent.id}
                                >
                                    <Button size="icon" className="btn-purple">
                                        <Cog />
                                    </Button>
                                </NavLink>
                                {agent?.name === "Agent Hoopz" && (
                                    <a
                                        href="https://x.com/AgentHoopz"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button
                                            size="icon"
                                            className="btn-purple"
                                        >
                                            <svg
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                                fill="white"
                                                className="r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-lrvibr r-m6rgpd r-lrsllp r-1nao33i r-16y2uox r-8kz0gk"
                                            >
                                                <g>
                                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                                                </g>
                                            </svg>
                                        </Button>
                                    </a>
                                )}
                                {agent?.name === "Agent High-roller host" && (
                                    <a
                                        href="https://t.me/cbhighrollerbot"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button
                                            size="icon"
                                            className="btn-purple"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 2400 2400"
                                            >
                                                <circle
                                                    cx="1200"
                                                    cy="1200"
                                                    r="1200"
                                                    fill="#0088cc"
                                                />
                                                <path
                                                    d="M1800 600L600 1050l300 150 900-600-750 750 0 300 150 0 150-150 300 150 150-750z"
                                                    fill="#fff"
                                                />
                                            </svg>
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
