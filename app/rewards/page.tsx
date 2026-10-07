import {getProducts,getWallet} from "@/lib/credits";
import {Rewards} from "@/components/Rewards";
export default async function Page(){const [wallet,products]=await Promise.all([getWallet(),getProducts()]);return <Rewards wallet={wallet} products={products}/>;}
