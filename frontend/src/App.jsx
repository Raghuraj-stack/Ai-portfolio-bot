// import React, { useState } from 'react'

// function App() {
//   const [messages, setMessages] = useState([])
//   const [input, setInput] = useState('')

//   async function handleSend(){
//     const question = input
//     setMessages((prev)=> [...prev , {role:'user' , text: input}])
//     setInput('')


//     try{
//       const response = await fetch("http://127.0.0.1:8000/chat" , {
//         method:'POST',
//         headers:{'Content-Type' : 'application/json'},
//         body:JSON.stringify({question : question })
//       })


//       const data = await response.json()


//       setMessages((prev)=>[...prev , {'role' : 'ai' , 'text' : data.answer}])
//     }catch(error){
//       setMessages((prev) => [...prev, { role: 'ai', text: 'Error: could not reach the server' }])
//     }
//   }



//   return (
//     <div className='bg-white flex-col'>
//       <div className='text-4xl flex items-center justify-center pt-3 pb-3  font-semibold tracking-widest text-gray-700'>Portfolio Bot</div>


//       <div className='bg-gray-500 h-140 ml-40 mr-40 rounded-xl'>
//         <div>
//         {messages.map((msg , index)=>(
//         <p className={msg.role == 'user' ? 'flex-col text-right bg-amber-200 p-3 mb-3 m-2 rounded-l-xl rounded-b-xl  ' : 'flex-col text-left mb-3 max-w-150 bg-amber-200 p-3 rounded-r-xl rounded-b-xl'} key={index}>
//           <b>{msg.role == 'ai' ? 'Ai' : 'You'} :</b> {msg.text}
//         </p>
//       ))}
//         </div>
//       </div>

//       <div className='flex justify-between mr-40 ml-40'>
//         <input  
//         className='mb-2 bg-gray-700 mt-3  p-3 text-white w-210 rounded-xl'
//       type="text"
//       value={input}
//       onChange={(e)=> setInput(e.target.value)}
//       placeholder='Type your question...'
//       />
//       <button className='bg-gray-900 text-white font-semibold w-25 cursor-pointer rounded-xl h-12 mt-3' onClick={handleSend}>Send</button>
//         </div>
     
//     </div>
//   )
// }

// export default App
import { useState, useRef, useEffect } from 'react'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend() {
    if (!input.trim()) return
    const question = input
    setMessages((prev) => [...prev, { role: 'user', text: question }])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await response.json()
      setMessages((prev) => [...prev, { role: 'ai', text: data.answer }])
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Error: could not reach the server' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl font-bold text-slate-100 mb-6">Ai Portfolio Bot ( <span className='px-3 py-0 rounded-full bg-green-400 text-base mr-2'></span> Raghuraj )</h1>

      <div className="w-full max-w-2xl flex flex-col bg-slate-800 rounded-xl overflow-hidden">
      
        <div className="flex flex-col gap-3 p-4 h-[500px] overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-slate-400 text-center mt-20">
              Ask me anything about the candidate.
            </p>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <p
                className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-amber-400 text-slate-900 rounded-br-sm'
                    : 'bg-slate-700 text-slate-100 rounded-bl-sm'
                }`}
              >
                {msg.text}
              </p>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <p className="bg-slate-700 text-slate-400 px-4 py-2 rounded-2xl italic">
                Thinking...
              </p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input row */}
        <div className="flex gap-2 p-4 border-t border-slate-700">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            className="flex-1 bg-slate-700 text-slate-100 placeholder-slate-400 rounded-lg px-4 py-2 outline-none "
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-amber-400 text-slate-900 font-semibold px-5 py-2 rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default App