import { getPageBySlug } from "@/lib/wordpress";
import { generateContentMetadata, stripHtml, decodeHtmlEntities } from "@/lib/metadata";
import Hero from "@/components/hero";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { JukeboxPlaylist } from "@/components/jukebox-playlist";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
	const page = await getPageBySlug("playlist-musicale-de-fous");

	if (!page) {
		return { title: "Playlist musicale de fous" };
	}

	const description = page.excerpt?.rendered
		? stripHtml(page.excerpt.rendered)
		: stripHtml(page.content.rendered).slice(0, 200) + "...";

	return generateContentMetadata({
		title: decodeHtmlEntities(page.title.rendered),
		description,
		slug: "playlist-musicale-de-fous",
		basePath: "pages",
	});
}

export default async function PlaylistMusicaleDeFousPage() {
	const page = await getPageBySlug("playlist-musicale-de-fous");

	if (!page) {
		notFound();
	}

	// Extraire l'iframe YouTube principale
	// Chercher un embed YouTube : iframe ou simple lien (playlist ou vidéo)
	const iframeMatch = page.content.rendered.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*><\/iframe>/i);
	const linkMatch = page.content.rendered.match(/https?:\/\/(?:www\.)?(?:youtube(?:-nocookie)?\.com\S*|youtu\.be\S*)/i);
	const rawSrc = iframeMatch?.[1] ?? linkMatch?.[0] ?? "";

	let youtubeSrc = rawSrc;
	if (rawSrc) {
		try {
			const url = new URL(rawSrc.startsWith('http') ? rawSrc : `https:${rawSrc}`);
			const host = url.hostname;
			const isYoutube = /youtube(?:-nocookie)?\.com$/.test(host) || host.includes('youtube.com');
			const isShort = host.includes('youtu.be');
			const listId = url.searchParams.get('list');
			const vId = url.searchParams.get('v');

			if (isYoutube || isShort) {
				if (listId) {
					youtubeSrc = `https://www.youtube.com/embed/videoseries?list=${listId}`;
				} else if (vId) {
					youtubeSrc = `https://www.youtube.com/embed/${vId}`;
				} else if (isShort && url.pathname.length > 1) {
					const id = url.pathname.slice(1);
					youtubeSrc = `https://www.youtube.com/embed/${id}`;
				} else if (url.pathname.includes('/embed/')) {
					youtubeSrc = rawSrc;
				}
			}
		} catch (e) {
			youtubeSrc = rawSrc;
		}
	}

	// Nettoyer le contenu pour ne pas afficher l'iframe deux fois
	const cleanedContent = page.content.rendered
		.replace(/<iframe[\s\S]*?<\/iframe>/i, "")
		.replace(/https?:\/\/(?:www\.)?(?:youtube(?:-nocookie)?\.com\S*|youtu\.be\S*)/i, "");

	// Construire la playlist à partir des lignes de texte non titres
	const stripHeadings = cleanedContent.replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, "");
	// Conserver une version avec balises pour extraire les liens
	const linesHtml = stripHeadings
		.replace(/<br\s*\/?>(?=\s*<br\s*\/?|\s*$)/gi, "\n")
		.replace(/<br\s*\/?>(?!\n)/gi, "\n")
		.replace(/<\/p>/gi, "\n")
		.split(/\n+/)
		.map((l) => l.trim())
		.filter(Boolean);

	const songs = linesHtml
		.map((lineHtml) => {
		// Extraire le lien depuis href ou URL brute
		const hrefMatch = lineHtml.match(/href=["']([^"']+)["']/i);
		const urlMatch = lineHtml.match(/https?:\/\/\S+/i);
		const linkRaw = hrefMatch?.[1] || urlMatch?.[0];
		const link = linkRaw ? linkRaw.replace(/[),.;]*$/, "") : undefined;

		// Nettoyer le texte de la ligne (supprimer balises, &nbsp;)
		const text = lineHtml
			.replace(/<[^>]+>/g, "")
			.replace(/&nbsp;/gi, " ");

		// Normaliser le séparateur : &#8211; ou &ndash; -> en dash
		const normalized = text
			.replace(/&#8211;|&ndash;/gi, "–")
			.replace(/&amp;#8211;/gi, "–");

		const parts = normalized.split("–").map((p) => decodeHtmlEntities(p.trim())).filter(Boolean);
		return parts.length >= 2
			? { title: parts[0], artist: parts.slice(1).join(" – "), link }
			: { title: decodeHtmlEntities(normalized), artist: "", link };
		})
		.filter((song) => song.title.length > 0 || song.artist.length > 0);

	return (
		<div className="mt-14">
			<Hero titre={page.title.rendered} sousTitre={""} />

                <div className="max-w-4xl mx-auto px-4 pt-16 pb-8">
				{youtubeSrc && (
					<div
						className={cn(
							"relative p-6 group flex flex-col not-prose",
							"border border-white/20",
							"hover:bg-white/5 transition-all duration-300",
							"before:absolute before:top-0 before:left-0 before:w-3 before:h-3",
							"before:border-t-2 before:border-l-2 before:border-yellow-500",
							"after:absolute after:bottom-0 after:right-0 after:w-3 after:h-3",
							"after:border-b-2 after:border-r-2 after:border-red-500",
							"before:transition-all before:duration-300 after:transition-all after:duration-300",
							"hover:before:w-6 hover:before:h-6 hover:after:w-6 hover:after:h-6"
						)}
					>
                 
						<div className="relative w-full aspect-video">
							<iframe
								src={youtubeSrc}
								title="Playlist musicale"
								className="absolute inset-0 w-full h-full"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							/>
						</div>
						<span className="absolute top-2 right-2 text-xs bg-red-600 text-white px-2 py-1 rounded-full">
							🎬 Vidéo
						</span>

					</div>                      
				)}  
            </div>

			<section className="max-w-4xl mx-auto px-4 pb-16 space-y-10">
				<style>
					{`
						.playlist-content a {
							color: #ef4444 !important;
						}
						.playlist-content a:hover {
							color: #dc2626 !important;
							text-decoration: underline;
						}
						.playlist-content h1 {
							font-size: 2.5rem;
							line-height: 1.2;
							margin: 3rem 0 1.5rem;
							font-weight: 500;
                            font-family: 'Belanosima', serif;
						}
						.playlist-content h2 {
							font-size: 2rem;
							line-height: 1.25;
							margin: 2.5rem 0 1.25rem;
							font-weight: 500;
                            font-family: 'Belanosima', serif;
						}
						.playlist-content h3 {
							font-size: 1.5rem;
							line-height: 1.3;
							margin: 2rem 0 1rem;
							font-weight: 500;
                            font-family: 'Belanosima', serif;
						}
						.playlist-content h4 {
							font-size: 1.25rem;
							line-height: 1.35;
							margin: 1.75rem 0 0.9rem;
							font-weight: 500;
                            font-family: 'Belanosima', serif;
						}
						.playlist-content p {
							margin-bottom: 1.5rem;
							line-height: 1.9;
						}
						.playlist-content ul,
						.playlist-content ol {
							margin: 1.25rem 0 1.5rem 1.5rem;
							line-height: 1.8;
						}
						.playlist-content blockquote {
							border-left: 4px solid rgb(239, 68, 68);
							padding-left: 1rem;
							margin: 1.5rem 0;
							color: rgb(107, 114, 128);
							font-style: italic;
						}
					`}
				</style>

				{songs.length > 0 && (
					<JukeboxPlaylist songs={songs} title={decodeHtmlEntities(page.title.rendered)} initialRevealCount={10} />
				)}      
                
             

			</section>
		</div>
	);
}
