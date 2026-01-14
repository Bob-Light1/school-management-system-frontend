import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
};

const Home = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  
  const stats = [
    { value: '10K+', label: 'Students Worldwide' },
    { value: '50+', label: 'Partner Countries' },
    { value: '98%', label: 'Success Rate' },
    { value: '24/7', label: 'Support Available' },
  ];

  const programs = [
    {
      icon: '🎓',
      title: 'Academic Excellence',
      description: 'Comprehensive preparation for international universities',
      color: 'from-[#4989c8] to-[#2a629a]',
    },
    {
      icon: '✈️',
      title: 'Immigration Guidance',
      description: 'Expert visa processing and documentation support',
      color: 'from-[#ff7f3e] to-[#ffda78]',
    },
    {
      icon: '💼',
      title: 'Career Pathways',
      description: 'Professional development and job placement assistance',
      color: 'from-[#2a629a] to-[#4989c8]',
    },
    {
      icon: '🌍',
      title: 'Cultural Integration',
      description: 'Language training and cultural adaptation programs',
      color: 'from-[#ffda78] to-[#ff7f3e]',
    },
  ];

  const testimonials = [
    {
      quote: 'This platform redefined how we manage international campuses.',
      author: 'Director Sarah M.',
      role: 'Campus Director',
      rating: 5,
    },
    {
      quote: 'An elite experience that simplified my immigration journey.',
      author: 'Student Ahmed K.',
      role: 'Graduate Student',
      rating: 5,
    },
    {
      quote: 'The support team is exceptional. They guided us every step.',
      author: 'Parent Maria L.',
      role: 'Parent',
      rating: 5,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#4989c8]/10 via-white to-[#ffda78]/20 overflow-hidden">

      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          style={{ y }}
          className="absolute top-20 left-10 w-72 h-72 bg-[#4989c8]/5 rounded-full blur-3xl"
        />
        <motion.div
          style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '-30%']) }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#ff7f3e]/5 rounded-full blur-3xl"
        />
      </div>

      {/* HERO with Particles Effect */}
      <section className="relative max-w-7xl mx-auto py-32 px-4 sm:px-6 lg:px-8 text-center">
        {/* Animated Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#4989c8]/20 rounded-full"
            animate={{
              x: [Math.random() * 1000, Math.random() * 1000],
              y: [Math.random() * 500, Math.random() * 500],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-[#ff7f3e] to-[#ffda78] rounded-full text-white font-semibold shadow-lg"
        >
          🌟 Welcome to Excellence
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-extrabold text-[#2a629a] mb-6 leading-tight"
        >
          Elite Immigration
          <br />
          <span className="bg-gradient-to-r from-[#ff7f3e] to-[#ffda78] bg-clip-text text-transparent">
            Preparation Academy
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          A premium ecosystem designed to prepare future global leaders for
          successful immigration, education, and career excellence.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center gap-6 mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(255, 127, 62, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-[#ff7f3e] to-[#ffda78] text-white px-10 py-4 rounded-full font-semibold shadow-lg"
          >
            Explore Programs →
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#4989c8' }}
            whileTap={{ scale: 0.95 }}
            className="border-2 border-[#4989c8] text-[#4989c8] px-10 py-4 rounded-full font-semibold hover:text-white transition"
          >
            Contact Us
          </motion.button>
        </motion.div>

        {/* Stats Counter */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              whileHover={{ scale: 1.1 }}
              className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, type: 'spring' }}
                className="text-4xl font-bold text-[#ff7f3e] mb-2"
              >
                {stat.value}
              </motion.div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* PROGRAMS Grid */}
      <section className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center text-[#2a629a] mb-4"
        >
          Our Premium Programs
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-center text-gray-600 mb-16 text-lg"
        >
          Comprehensive solutions for your global journey
        </motion.p>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {programs.map((program, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative bg-white p-8 rounded-2xl shadow-xl border border-white overflow-hidden cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${program.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
                className="text-6xl mb-4"
              >
                {program.icon}
              </motion.div>
              
              <h3 className="text-xl font-bold text-[#2a629a] mb-3">
                {program.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {program.description}
              </p>
              
              <motion.div
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${program.color}`}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center text-[#2a629a] mb-16"
        >
          Designed for Excellence
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: 'Directors & Managers',
              text: 'Executive dashboards, real-time analytics, and multi-campus governance.',
              icon: '👔',
              gradient: 'from-[#2a629a] to-[#4989c8]',
            },
            {
              title: 'Teachers & Partners',
              text: 'Premium collaboration tools, scheduling, and resource management.',
              icon: '📚',
              gradient: 'from-[#4989c8] to-[#2a629a]',
            },
            {
              title: 'Students & Parents',
              text: 'Personalized learning paths, progress tracking, and secure communication.',
              icon: '🎯',
              gradient: 'from-[#ff7f3e] to-[#ffda78]',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -10 }}
              className="relative group bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.gradient} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
              
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                className="text-5xl mb-4"
              >
                {item.icon}
              </motion.div>
              
              <h3 className="text-2xl font-semibold text-[#4989c8] mb-4">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{item.text}</p>
              
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: i * 0.2 }}
              >
                <div className={`h-full bg-gradient-to-r ${item.gradient}`} />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CAMPUSES with Interactive Hover */}
      <section className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#2a629a] to-[#4989c8] text-white p-12 shadow-2xl">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-6"
          >
            Our Global Campuses
          </motion.h2>
          
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center text-white/80 mb-16 text-lg"
          >
            World-class facilities across three continents
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { city: 'Paris', country: 'France', students: '3,500+' },
              { city: 'New York', country: 'USA', students: '4,200+' },
              { city: 'Toronto', country: 'Canada', students: '2,800+' },
            ].map((campus, i) => (
              <motion.div
                key={campus.city}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer"
              >
                <div className="w-full h-64 bg-gradient-to-br from-[#4989c8] to-[#2a629a] flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: i * 0.2, type: 'spring' }}
                    className="text-8xl opacity-20 group-hover:opacity-40 transition-opacity"
                  >
                    🏛️
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ y: 100 }}
                  whileHover={{ y: 0 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-6"
                >
                  <h3 className="text-3xl font-bold mb-1">{campus.city}</h3>
                  <p className="text-sm text-[#ffda78] mb-2">{campus.country}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      {campus.students} students
                    </span>
                  </div>
                  
                  <motion.button
                    whileHover={{ x: 5 }}
                    className="mt-4 text-[#ffda78] font-semibold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Learn more →
                  </motion.button>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS with Carousel Effect */}
      <section className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center text-[#2a629a] mb-6"
        >
          Trusted by an Elite Community
        </motion.h2>
        
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-center text-gray-600 mb-16 text-lg"
        >
          Hear from our successful members
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-2xl shadow-xl border-l-4 border-[#ff7f3e] relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 text-9xl text-[#4989c8]/5 font-serif">"</div>
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <motion.span
                    key={j}
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.2 + j * 0.1 }}
                    className="text-[#ffda78] text-xl"
                  >
                    ★
                  </motion.span>
                ))}
              </div>
              
              <p className="italic text-gray-600 mb-6 leading-relaxed relative z-10">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4989c8] to-[#2a629a] flex items-center justify-center text-white font-bold text-xl">
                  {testimonial.author[0]}
                </div>
                <div>
                  <p className="font-semibold text-[#4989c8]">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA with Animated Background */}
      <section className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 mb-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="relative text-center rounded-3xl bg-gradient-to-r from-[#ff7f3e] to-[#ffda78] text-[#2a629a] p-16 overflow-hidden shadow-2xl"
        >
          {/* Animated Background Shapes */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />

          <motion.div variants={scaleIn} className="relative z-10">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block text-6xl mb-6"
            >
              🚀
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Join the Elite?
            </h2>
            <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Begin your premium immigration journey today and unlock a world of opportunities.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.1, boxShadow: '0 30px 60px rgba(42, 98, 154, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#2a629a] text-white px-12 py-5 rounded-full font-semibold shadow-xl text-lg"
            >
              Get Started Now →
            </motion.button>
            
            <motion.p
              variants={fadeUp}
              className="mt-6 text-sm text-[#2a629a]/70"
            >
              Join 10,000+ successful students worldwide
            </motion.p>
          </motion.div>
        </motion.div>
      </section>

    </main>
  );
};

export default Home;