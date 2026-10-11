"use client";
import {useEffect,useState} from "react";
import {loadPortfolioData} from "@/lib/content-store";
import {initialPhotography,normalizePhotography,type PhotographyContent} from "@/lib/photography-content";
export function usePhotography(initial?: PhotographyContent){const [content,setContent]=useState<PhotographyContent>(()=>initial??initialPhotography());const [ready,setReady]=useState(initial!==undefined);useEffect(()=>{const sync=async()=>{try{setContent(normalizePhotography((await loadPortfolioData()).photography));}catch{}setReady(true);};const handleSync=()=>void sync();void sync();window.addEventListener("storage",handleSync);window.addEventListener("portfolio-content-updated",handleSync);window.addEventListener("focus",handleSync);return()=>{window.removeEventListener("storage",handleSync);window.removeEventListener("portfolio-content-updated",handleSync);window.removeEventListener("focus",handleSync);};},[]);return {content,ready};}
