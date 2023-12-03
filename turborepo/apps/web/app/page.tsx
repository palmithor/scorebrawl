import Image from "next/image";


export default function Page(): JSX.Element {
  return (
    <div style={{background: "#030816"}} className="flex items-center justify-center min-h-screen">
          <Image
            priority={true}
            src="/scorebrawl.jpg"
            width={500}
            height={500}
            alt="Header image"
            className="rounded-lg"
          />
      </div>
  );
}
