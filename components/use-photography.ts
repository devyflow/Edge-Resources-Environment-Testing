"use client";
import {useEffect,useState} from "react";
import {loadPortfolioData} from "@/lib/content-store";
import {initialPhotography,normalizePhotography} from "@/lib/photography-content";
export function usePhotography(){const [content,setContent]=useState(initialPhotography);const [ready,setReady]=useState(false);useEffect(()=>{const sync=async()=>{try{setContent(normalizePhotography((await loadPortfolioData()).photography));}catch{}setReady(true);};const handleSync=()=>void sync();void sync();window.addEventListener("storage",handleSync);window.addEventListener("portfolio-content-updated",handleSync);window.addEventListener("focus",handleSync);return()=>{window.removeEventListener("storage",handleSync);window.removeEventListener("portfolio-content-updated",handleSync);window.removeEventListener("focus",handleSync);};},[]);return {content,ready};}
