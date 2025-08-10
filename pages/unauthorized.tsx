export default function Unauthorized() {
  return (
    <div style={{fontFamily:'Inter,system-ui,Segoe UI,Roboto,sans-serif',display:'flex',minHeight:'100vh',alignItems:'center',justifyContent:'center',padding:'2rem',textAlign:'center'}}>
      <div style={{maxWidth:620,background:'#fff3cd',border:'1px solid #ffecb5',borderRadius:8,padding:'1.5rem',color:'#664d03'}}>
        <h2 style={{marginTop:0}}>Access restricted</h2>
        <p>Please open the access link from your purchase email to view this guide.</p>
        <p style={{fontSize:12,color:'#6b7280'}}>If you believe this is a mistake, try opening the link in the same browser/device you used for OTP verification.</p>
      </div>
    </div>
  )
}
