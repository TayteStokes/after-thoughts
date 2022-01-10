import React from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { Header } from './Header'
import { Footer } from './Footer'

export const Layout = ({ children, metaDataOverrides }) => {
  const router = useRouter()
  const metaData = {
    title: 'After Thoughts',
    description: 'A software development blog created by Tayte Stokes',
    author: 'Tayte Stokes',
    type: 'website',
    url: 'https://afterthoughts.dev',
    ...metaDataOverrides,
  }

  return (
    <div className="w-screen min-h-screen overflow-hidden flex flex-col">
      <Head>
        <title>{metaData.title}</title>
        <meta name="description" content={metaData.description} />
        <meta name="author" content={metaData.author} />
        <meta name="viewport" content="width=device-width,initial-scale=1.0"></meta>
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content={metaData.type} />
        <meta property="og:title" content={metaData.title} />
        <meta property="og:image" content={`${metaData.url}/after-thoughts-block-logo.jpg`} />
        <meta property="og:url" content={`${metaData.url}${router.asPath}`} />
        <meta property="og:description" content={metaData.description} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="After Thoughts" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={metaData.title} />
        <meta name="twitter:description" content={metaData.description} />
        <meta name="twitter:image" content={`${metaData.url}/after-thoughts-block-logo.jpg`} />
        <meta name="twitter:site" content="@taytestokes" />
        <meta name="twitter:creator" content="@taytestokes" />
        <link rel="canonical" href={`${metaData.url}${router.asPath}`} />
      </Head>

      <main className="container relative flex flex-col grow items-center mx-auto px-4">
        <Header />
        <div className="w-full grow">{typeof children === 'function' ? children() : children}</div>
        <Footer />
      </main>
    </div>
  )
}
