const ContactForm = ({
  mapSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.7!2d3.35!3d6.6!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMzYnMDAuMCJOIDPCsDIxJzAwLjAiRQ!5e0!3m2!1sen!2sng!4v1234567890",
  onSubmit,
}) => {
  const inputClass = `w-full bg-[#eef0ff] border border-transparent focus:border-[#A033A0]
                      focus:outline-none px-4 py-5 font-dm-sans text-gray-700
                      text-sm placeholder-gray-400 transition-colors duration-300`

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(e)
  }

  return (
    <section className="py-16 md:px-[7rem] bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left — Form */}
          <div className="w-full lg:w-1/2">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              {/* Name + Email */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex flex-col gap-2 w-full">
                  <label className="font-dm-sans text-gray-700 text-sm font-medium">Name</label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    className={inputClass}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <label className="font-dm-sans text-gray-700 text-sm font-medium">Your Email</label>
                  <input
                    type="email"
                    placeholder="Your email address"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-2">
                <label className="font-dm-sans text-gray-700 text-sm font-medium">Your Subject</label>
                <input
                  type="text"
                  placeholder="What is this about?"
                  className={inputClass}
                  required
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <label className="font-dm-sans text-gray-700 text-sm font-medium">Your Message</label>
                <textarea
                  rows={7}
                  placeholder="Write your message here..."
                  className={`${inputClass} resize-none`}
                  required
                />
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  className="bg-[#A033A0] hover:bg-[#525fe1] text-white font-jost font-semibold
                             px-10 py-4 transition-colors duration-300"
                >
                  Send Message
                </button>
              </div>

            </form>
          </div>

          {/* Right — Map */}
          <div className="w-full lg:w-1/2 min-h-[400px] rounded-2xl overflow-hidden shadow-md">
            <iframe
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ minHeight: '450px', border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Royal Gem Schools Location"
            />
          </div>

        </div>
      </div>
    </section>
  )
}

export default ContactForm