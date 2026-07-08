import React from 'react'

function Card(props) {
  return (

      <div className="md:max-w-sm w-full p-6 rounded-xl shadow-xl bg-black border border-zinc-800 hover:border-white transition-all duration-300 hover:scale-105 group">
        <div className="relative overflow-hidden rounded-lg mb-6">
          <img
            src={props.image}
            alt={props.alt} 
            width={400}
            height={300}
            className="object-cover object-center w-full h-48 transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="mb-4">
          <span className="inline-block px-3 py-1 text-xs font-medium tracking-wider uppercase bg-white text-black rounded-full mb-3">
            <h1 className="text-lg font-semibold">{props.username}</h1>
          </span>
          <h2 className="text-xl font-bold text-black mb-2 group-hover:text-gray-300 transition-colors duration-200">
            {props.description}
          </h2>
        </div>
      </div>  )
}

export default Card