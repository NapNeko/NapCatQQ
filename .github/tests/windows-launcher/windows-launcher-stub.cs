using System;
using System.Diagnostics;
using System.IO;
using System.Text;

public class NapCatLauncherAudit {
    public static int Main(string[] arguments) {
        string name = Path.GetFileNameWithoutExtension(Process.GetCurrentProcess().MainModule.FileName);
        if (name == "reg") {
            string uninstall = Environment.GetEnvironmentVariable("NAPCAT_AUDIT_UNINSTALL");
            if (String.IsNullOrEmpty(uninstall)) return 1;
            Console.OutputEncoding = new UTF8Encoding(false);
            Console.WriteLine("    UninstallString    REG_SZ    " + uninstall);
            return 0;
        }
        if (name == "net") return Int32.Parse(Environment.GetEnvironmentVariable("NAPCAT_AUDIT_NET_STATUS"));
        string output = Environment.GetEnvironmentVariable("NAPCAT_AUDIT_OUTPUT");
        using (StreamWriter writer = new StreamWriter(output, false, new UTF8Encoding(false))) {
            writer.WriteLine(name);
            foreach (string argument in arguments) writer.WriteLine(Convert.ToBase64String(Encoding.UTF8.GetBytes(argument)));
        }
        return Int32.Parse(Environment.GetEnvironmentVariable("NAPCAT_AUDIT_BOOT_STATUS") ?? "0");
    }
}
