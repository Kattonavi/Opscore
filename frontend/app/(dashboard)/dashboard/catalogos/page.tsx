"use client";

import { useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATALOG_SECTIONS } from "@/features/catalogos/data";

export default function CatalogosPage() {
  const { t, mounted } = useI18n();
  const [activeTab, setActiveTab] = useState(CATALOG_SECTIONS[0].key);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("catalogosPage.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("catalogosPage.subtitle")}
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
        <TabsList className="w-full">
          {CATALOG_SECTIONS.map((section) => (
            <TabsTrigger key={section.key} value={section.key} className="flex-1">
              {t(section.tabKey)}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATALOG_SECTIONS.map((section) => (
          <TabsContent key={section.key} value={section.key}>
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {section.values.map((v) => {
                    const item = section.getItem(v);
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.value}
                        className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-primary/50"
                      >
                        <div className={cn("rounded-md p-2", item.color.replace("bg-", "bg-") + "/10")}>
                          <Icon className={cn("h-4 w-4", item.color)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {t(item.labelKey)}
                          </p>
                          <Badge variant="outline" className="mt-0.5 text-[10px] font-mono">
                            {item.value}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Footer */}
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-6">
          <p className="text-sm text-muted-foreground text-center">
            {t("catalogosPage.footer")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
